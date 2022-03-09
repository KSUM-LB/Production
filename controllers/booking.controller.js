const Validator = require("fastest-validator");
const models = require("../models");

// -- Create Booking
exports.createBooking = (req, res) => {
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
  console.log(booking);
  // -- Validating data passed in request body
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
  const v = new Validator();
  const validationResponse = v.validate(booking, booking_schema);
  if (validationResponse != true) {
    return res.status(406).json({
      message: "Error in Data format",
      error: validationResponse,
    });
  } else {
    res.status(200).json({ message: "success" });
  }
};
