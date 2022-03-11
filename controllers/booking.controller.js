const Validator = require("fastest-validator");
const { sequelize } = require("../models");
const models = require("../models");

// -- Create Booking
exports.createBooking = async (req, res) => {
  // -- Getting booking info
  const inDate = req.body.checkIn.split("-");
  const outDate = req.body.checkOut.split("-");
  const booking = {
    manuel: req.body.manuel,
    status: true,
    CC: req.body.CC,
    payed: req.body.payed,
    userId: req.userData.userId,
    // QrCode:
    nbOfTravellers: req.body.nbOfTravellers,
    nbOfRooms: req.body.nbOfRooms,
    nbOfTables: req.body.nbOfTables,
    checkIn: new Date(inDate[0], inDate[1] - 1, inDate[2]),
    checkOut: new Date(outDate[0], outDate[1] - 1, outDate[2]),
    price: req.body.price,
    couponId: req.body.couponId,
    total: req.body.total,
  };
  // -- Validating data passed in request body for booking info
  const booking_schema = {
    manuel: { type: "boolean", optional: false },
    status: { type: "boolean", optional: true, default: true },
    CC: { type: "boolean", optional: false },
    payed: { type: "boolean", optional: false },
    userId: { type: "number", optional: false },
    nbOfTravellers: { type: "number", optional: false },
    nbOfRooms: { type: "number", optional: false },
    nbOfTables: { type: "number", optional: false },
    checkIn: { type: "date", optional: false },
    checkOut: { type: "date", optional: false },
    price: { type: "number", optional: false },
    couponId: { type: "number", optional: true },
    total: { type: "number", optional: false },
  };
  const vBooking = new Validator();
  const bookingValidation = vBooking.validate(booking, booking_schema);
  if (bookingValidation != true) {
    return res.status(406).json({
      message: "Error in booking data",
      error: bookingValidation,
    });
  } else {
    // -- Creating Transaction
    try {
      const result = await sequelize.transaction(async (t) => {
        // -- Inserting booking info
        const bookingDB = await models.Bookings.create(booking, {
          transaction: t,
        });
        // -- Looping over rooms
        for (var i = 0; i < bookingDB.nbOfRooms; i++) {
          // -- Getting room info
          const room = {
            roomId: req.body.rooms[i].roomId,
            bookingId: bookingDB.id,
            nbOfPeople: req.body.rooms[i].nbOfPeople,
          };
          // -- Validating data passed in request body for room
          const room_schema = {
            roomId: { type: "number", optional: false },
            bookingId: { type: "number", optional: false },
            nbOfPeople: { type: "number", optional: false },
          };
          const vRoom = new Validator();
          const roomValidation = vRoom.validate(room, room_schema);
          if (roomValidation != true) {
            t.rollback();
            return res.status(406).json({
              message: "Error in room data",
              error: roomValidation,
            });
          } else {
            const roomDB = await models.RoomBooking.create(room, {
              transaction: t,
            });
          }
        }
        if (bookingDB.CC) {
          // -- Getting ccinfo
          const ccinfo = {
            bookingId: bookingDB.id,
            cardNumber: req.body.ccinfo.cardNumber,
            expirationDate: req.body.ccinfo.expirationDate,
            cardCode: req.body.ccinfo.cardCode,
            cardHolder: req.body.ccinfo.cardHolder,
          };
          // -- Validating data passed in request body for ccinfo
          const ccinfo_schema = {
            bookingId: { type: "number", optional: false },
            cardNumber: { type: "string", optional: false },
            expirationDate: { type: "string", optional: false },
            cardCode: { type: "number", optional: false },
            cardHolder: { type: "string", optional: false },
          };
          const vRoom = new Validator();
          const ccinfovalidation = vRoom.validate(ccinfo, ccinfo_schema);
          if (ccinfovalidation != true) {
            t.rollback();
            return res.status(406).json({
              message: "Error in credit card data",
              error: ccinfovalidation,
            });
          } else {
            // -- Inserting CCinfo
            const CCinfoDB = await models.CCinfo.create(ccinfo, {
              transaction: t,
            });
          }
        }
        // -- Responding with all data
        res.status(200).json({ message: "success"});
      });
    } catch (error) {
      res.status(500).json({
        message: "Server Error",
        error: error,
      });
    }
  }
};
