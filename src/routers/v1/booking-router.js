const express = require('express');
const { BookingController } = require('../../controller');
// const { booking_Controller } = require('../../controller/booking-controller');

const bookingRouter = express.Router();

/**
 * http://localhost:2000/api/v1/bookings/
 */
bookingRouter.post('/',BookingController.booking_Controller);

/**
 * http://localhost:2000/api/v1/bookings/payments
 */
bookingRouter.post('/payments',BookingController.makePayment_Controller);
module.exports = bookingRouter;
