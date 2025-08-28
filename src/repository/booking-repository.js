const {StatusCodes} = require('http-status-codes');
const {Booking} = require('../models');
const CrudRepository = require('./crud-Repository');
const { Op } = require("sequelize");
const {Enum} = require('../utils/common');
const {BOOKED, CANCELLED} = Enum.BOOKING_STATUS;
class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking);
    }

    async createBooking(data, transaction){
        const response = await Booking.create(data, {transaction : transaction});
        return response;
    }

    async get(id, transaction){
        const response = await Booking.findByPk(id,{transaction : transaction});
        return response;
    }

    async update(id,data,transaction){
        const response = await Booking.update(data,{
            where : {
                id : id
            }
        },{transaction : transaction});
        return response;
    }

    async cancelOldBooking(timeStamp){
        const response = await Booking.update({status : CANCELLED},{
            where : {
                [Op.and] : [
                    {
                        createdAt : {
                            [Op.lt] : timeStamp
                        }
                    },
                    {
                        status : {
                            [Op.ne] : BOOKED
                        }
                    },
                    {
                        status : {
                            [Op.ne] : CANCELLED
                        }
                    }
                ]
            }
        });
        return response;
    }
}

module.exports = BookingRepository;
