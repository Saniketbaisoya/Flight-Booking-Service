const axios = require('axios');
const AppError = require('../../../Flight_Service/src/utils/errors/error');
const {StatusCodes} = require('http-status-codes');
const db = require('../models');

const {serverConfig} = require('../config')
const {BookingRepository} = require('../repository');

async function  createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await axios.get(`${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        const FlightData = flight.data.data;
        /**
         * Now it means if the user send the data of seats that they are trying to boook
         * And if the userSeats is more than available seats in the flight in which they book 
         * Then throw an error....
         * But if the seats are enough then calculate the totalBillingAmount and add into the totalCost of the bookingModel
         * Then send the repo to create the booking corresponding to the Booking Model data....
         */
        if(data.noOfSeats > FlightData.totalSeats){
            throw new AppError("Not enough seats available",StatusCodes.BAD_REQUEST);
        }
        const totalBillingAmount = data.noOfSeats * FlightData.price;
        console.log(totalBillingAmount);
        console.log(data.noOfSeats);
        console.log(data.flightId);
        /**
         * Now spread operator(...) mtlb jo purana data hai user ne jb send kiya tha req.body mai voh + totalCost = totalBillingAmount yeah add krke diya
         * Kyunki repository booking corresponding to userId tbhi create hoga jb bookingModel ke sare required attributes mil jayege
         * And usme totalCost is also required to send 
         * For status default value INITIATED
        */

        const bookingPayload = {...data, totalCost: totalBillingAmount};
        /**
         * Now abb hmne Booking krli along with the transaction property.....
         * Isliye hmne yha crudRepo ka create use ni kiya kyuki voh data se hi create krta hai bss 
         * But with transaction property create krne ke liye BoookingRepo mai ek new function chahiye
         * Then we will implement the custom filter createBooking function
         * Now abb bina transaction ke booking create ho nhi skti kyuki booking ko create ka pura operation in single transaction hmne build kiya hain....
        */
        const booking = await new BookingRepository().createBooking(bookingPayload, transaction);
        await axios.patch(`${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats` , {
            seats: data.noOfSeats
        });
        await transaction.commit();
        return booking;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
    createBooking
};
