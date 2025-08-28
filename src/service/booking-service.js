const axios = require('axios');
const AppError = require('../../../Flight_Service/src/utils/errors/error');
const {StatusCodes} = require('http-status-codes');
const db = require('../models');

const {serverConfig} = require('../config')
const {BookingRepository} = require('../repository');

const {Enum} = require('../utils/common');
const {BOOKED, CANCELLED ,INITIATED, PENDING} = Enum.BOOKING_STATUS;
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

/**
 * Now ab makePayment feature ko implement krege jisme data ayega which contains bookingId,totalCost,userId........
 * Now yeah data send krega user, payment krte time
 * Now agr uss bookingId ke correspondingly jo totalCost for a noOfSeats calculate hui thi agr voh match nhi hui 
 * Then hmm error throw kredege and also agr userId corresponding to bookingId userId is not match then again error
 * Now again iss feature ko bhi in one operation hmme complete krna hai...(transaction)
 */
async function makePayment(data){
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await new BookingRepository().get(data.bookingId, transaction);
        if(bookingDetails.status == CANCELLED){
            throw new AppError("The booking has expired",StatusCodes.BAD_REQUEST);
        }
        const currentTime = new Date();
        const bookingTime = new Date(bookingDetails.createdAt);

        if((currentTime - bookingTime > 300000 && bookingDetails.status == INITIATED) || (currentTime - bookingTime > 300000 && bookingDetails.status == PENDING) ){
            await cancelBooking(data.bookingId);
            throw new AppError("The booking has expired",StatusCodes.BAD_REQUEST)
        }
        if(bookingDetails.totalCost != data.totalCost){
            throw new AppError("The amount of the payment doesn't match",StatusCodes.BAD_REQUEST)
        }
        if(bookingDetails.userId != data.userId){
            throw new AppError("The user corresponding to the booking doesnt match",StatusCodes.BAD_REQUEST)
        }
        // We assumed here that payment is Successfull
        await new BookingRepository().update(data.bookingId,{status : BOOKED},transaction);

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}


async function cancelBooking(bookingId) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await new BookingRepository().get(bookingId ,transaction);
        if(bookingDetails.status == CANCELLED){
            await transaction.commit();
            return true;
        }
        // if the status corresponding to bookingId is not CANCELLED then we would update it
        await new BookingRepository().update(bookingId, {status : CANCELLED}, transaction);

        await axios.patch(`${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,{
            seats : bookingDetails.noOfSeats,
            dec : 0
        })
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    } 
}

async function cancelOldBookings() {
    try{
        const time = new Date(Date.now() - 1000 * 300); // time is 5 min ago
        const response = await new BookingRepository().cancelOldBooking(time);

        return response;
    }catch(error){
        throw error;
    }
}
module.exports = {
    createBooking,
    makePayment,
    cancelOldBookings
};
