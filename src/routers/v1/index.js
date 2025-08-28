const express = require('express');
const bookingRouter = require('./booking-router');

const v1Router = express.Router();

/**
 * http://localhost:2000/api/v1/bookings
 */
v1Router.use('/bookings',bookingRouter);

module.exports = v1Router;
