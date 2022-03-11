const Validator = require("fastest-validator");
const { sequelize } = require("../models");
const models = require("../models");

// -- Create Booking
// exports.createBooking = (req, res) => {
//   // -- Getting booking info
//   const inDate = req.body.checkIn.split("-");
//   const outDate = req.body.checkOut.split("-");
//   const booking = {
//     manuel: req.body.manuel,
//     status: true,
//     CC: req.body.CC,
//     payed: req.body.payed,
//     userId: req.userData.userId,
//     // QrCode:
//     nbOfTravellers: req.body.nbOfTravellers,
//     nbOfRooms: req.body.nbOfRooms,
//     nbOfTables: req.body.nbOfTables,
//     checkIn: new Date(inDate[0], inDate[1] - 1, inDate[2]),
//     checkOut: new Date(outDate[0], outDate[1] - 1, outDate[2]),
//     price: req.body.price,
//     couponId: req.body.couponId,
//     total: req.body.total,
//   };
//   // -- Validating data passed in request body for booking info
//   const booking_schema = {
//     manuel: { type: "boolean", optional: false },
//     status: { type: "boolean", optional: true, default: true },
//     CC: { type: "boolean", optional: false },
//     payed: { type: "boolean", optional: false },
//     userId: { type: "number", optional: false },
//     nbOfTravellers: { type: "number", optional: false },
//     nbOfRooms: { type: "number", optional: false },
//     nbOfTables: { type: "number", optional: false },
//     checkIn: { type: "date", optional: false },
//     checkOut: { type: "date", optional: false },
//     price: { type: "number", optional: false },
//     couponId: { type: "number", optional: true },
//     total: { type: "number", optional: false },
//   };
//   const v = new Validator();
//   const validationResponse = v.validate(booking, booking_schema);
//   if (validationResponse != true) {
//     return res.status(406).json({
//       message: "Error in Data format",
//       error: validationResponse,
//     });
//   } else {
//     // -- Creating transaction
//     sequelize
//       .transaction(async (t) => {
//         console.log("1111111111111111111");
//         // -- Inserting booking info
//         models.Bookings.create(booking)
//           .then((result) => {
//             // -- Getting ccinfo
//             const ccinfo = {
//               bookingId: result.id,
//               cardNumber: req.body.ccinfo.cardNumber,
//               expirationDate: req.body.ccinfo.expirationDate,
//               cardCode: req.body.ccinfo.cardCode,
//               cardHolder: req.body.ccinfo.cardHolder,
//             };
//             // -- Validating data passed in request body for ccinfo
//             const ccinfo_schema = {
//               bookingId: { type: "number", optional: false },
//               cardNumber: { type: "number", optional: false },
//               expirationDate: { type: "number", optional: false },
//               cardCode: { type: "number", optional: false },
//               cardHolder: { type: "string", optional: false },
//             };
//             const v1 = new Validator();
//             const validationResponseCCinfo = v1.validate(ccinfo, ccinfo_schema);
//             if (validationResponseCCinfo != true) {
//               return res.status(406).json({
//                 message: "Error in Data format",
//                 error: validationResponse,
//               });
//             } else {
//               models.CCINFO.create(ccinfo)
//                 .then(console.log("------------- SUCCESS ------------"))
//                 .catch((err) =>
//                   res.status(500).json({
//                     message: "Server Error",
//                     error: err,
//                   })
//                 );
//             }
//           })
//           .catch((err) =>
//             res.status(500).json({
//               message: "Server Error",
//               error: err,
//             })
//           );
//       })
//       .then(res.status(200).json({ message: "success", test: "test" }))
//       .catch((err) =>
//         res.status(500).json({
//           message: "Server Error",
//           error: err,
//         })
//       );
//   }
// };

exports.createBooking = (req, res) => {
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
  const v = new Validator();
  const bookingValidation = v.validate(booking, booking_schema);
  if (bookingValidation != true) {
    return res.status(406).json({
      message: "Error in Data format",
      error: bookingValidation,
    });
  } else {
    // -- Inserting booking info
    models.Bookings.create(booking)
      .then((result) => {
        // -- Getting ccinfo
        const ccinfo = {
          bookingId: result.id,
          cardNumber: req.body.ccinfo.cardNumber,
          expirationDate: req.body.ccinfo.expirationDate,
          cardCode: req.body.ccinfo.cardCode,
          cardHolder: req.body.ccinfo.cardHolder,
        };
        console.log(ccinfo);
        // -- Validating data passed in request body for ccinfo
        const ccinfo_schema = {
          bookingId: { type: "number", optional: false },
          cardNumber: { type: "string", optional: false },
          expirationDate: { type: "string", optional: false },
          cardCode: { type: "number", optional: false },
          cardHolder: { type: "string", optional: false },
        };
        const v1 = new Validator();
        const ccinfoalidation = v1.validate(ccinfo, ccinfo_schema);
        if (ccinfoalidation != true) {
          return res.status(406).json({
            message: "Error in Data format",
            error: ccinfoalidation,
          });
        } else {
          // -- Inserting CCinfo
          models.CCinfo.create(ccinfo)
            .then((result) =>
              res.status(200).json({ message: "Success", result })
            )
            .catch((err) =>
              res.status(500).json({
                message: "Server Error",
                error: err,
              })
            );
        }
      })
      .catch((err) =>
        res.status(500).json({
          message: "Server Error",
          error: err,
        })
      );
  }
};
