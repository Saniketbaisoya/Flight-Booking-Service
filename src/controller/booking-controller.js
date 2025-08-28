const { BookingService } = require('../service');
const { SuccessResponse, ErrorResponse } = require('../utils/common');
const {StatusCodes} = require('http-status-codes');


/**
 * req.body = {
 *  flightId: req.body.flightId,
 *  userId : req.body.userId,
 *  noOfSeats : req.body.noOfSeats
 * }
 */
async function booking_Controller(req,res) {
    try {
        const response = await BookingService.createBooking({
            flightId : req.body.flightId,
            userId : req.body.userId,
            noOfSeats : req.body.noOfSeats  
        });
        SuccessResponse.message = "Successfully Created the Booking";
        SuccessResponse.data = response;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Something went wrong can't created Successfully";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

module.exports = {
    booking_Controller
}