const Validator = require("fastest-validator");
const models = require("../models");

// -- Create Booking
exports.createBooking = (req, res) => {
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
    checkIn: req.body.checkIn,
    checkOut: req.body.checkOut,
    price: req.body.price,
    couponId: req.body.couponId,
    total: req.body.total,
  };
  console.log(booking);
  // -- Validating data passed in request body
  //   const bookig_schema = {
  //     fullName: { type: "string", optional: false },
  //     email: { type: "string", optional: false },
  //     password: { type: "string", optional: false },
  //     phoneNb: { type: "string", optional: true },
  //   };
  res.status(200).json({ message: "success" });
};
