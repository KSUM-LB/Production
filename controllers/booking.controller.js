const Validator = require("fastest-validator");
const { sequelize } = require("../models");
const models = require("../models");
const QRCode = require("qrcode");
const { chargeCreditCard } = require("../middlewares/chargeCreditCard");

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
    checkIn: new Date(inDate[0], inDate[2], inDate[1] - 1),
    checkOut: new Date(outDate[0], outDate[2], outDate[1] - 1),
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
        // -- Creating QR Code
        // const data = {
        //   bookingId: bookingDB.bookingId,
        //   userId: req.userData.userId,
        // };
        // const stringdata = JSON.stringify(data);
        // QRCode.toString(
        //   stringdata,
        //   { type: "terminal" },
        //   function (err, QRcode) {
        //     if (err)
        //       console.log("------------------ error occurred ----------------");
        //     console.log(QRcode);
        //   }
        // );
        // QRCode.toDataURL(stringdata, function (err, code) {
        //   if (err)
        //     console.log("------------------ error occurred ----------------");
        //   console.log(code);
        // });
        // -- Looping over tables
        for (var i = 0; i < bookingDB.nbOfTables; i++) {
          // -- Getting table info
          const table = {
            tableId: req.body.tables[i].tableId,
            bookingId: bookingDB.id,
            nbOfPeople: req.body.tables[i].nbOfPeople,
          };
          // -- Validating data passed in request body for table
          const table_schema = {
            tableId: { type: "number", optional: false },
            bookingId: { type: "number", optional: false },
            nbOfPeople: { type: "number", optional: false },
          };
          const vtable = new Validator();
          const tableValidation = vtable.validate(table, table_schema);
          if (tableValidation != true) {
            t.rollback();
            return res.status(406).json({
              message: "Error in table data",
              error: tableValidation,
            });
          } else {
            const tableDB = await models.TableBooking.create(table, {
              transaction: t,
            });
            models.Table.increment("booked", {
              by: table.nbOfPeople,
              where: { id: table.tableId },
            }).catch((err) => t.rollback());
          }
        }
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
            models.Room.increment("booked", {
              by: 1,
              where: { id: room.roomId },
            }).catch((err) => t.rollback());
          }
        }
        // -- Looping over travellers
        for (var i = 0; i < bookingDB.nbOfTravellers; i++) {
          // -- Getting traveller info
          const dobDate = req.body.travellers[i].dob.split("-");
          const traveller = {
            bookingId: bookingDB.id,
            fullname: req.body.travellers[i].fullname,
            dob: new Date(dobDate[0], dobDate[1] - 1, dobDate[2]),
            nationality: req.body.travellers[i].nationality,
          };
          // -- Validating data passed in request body for traveller
          const traveller_schema = {
            bookingId: { type: "number", optional: false },
            fullname: { type: "string", optional: false },
            dob: { type: "date", optional: false },
            nationality: { type: "string", optional: false },
          };
          const vTraveller = new Validator();
          const travellerValidation = vTraveller.validate(
            traveller,
            traveller_schema
          );
          if (travellerValidation != true) {
            t.rollback();
            return res.status(406).json({
              message: "Error in traveller data",
              error: travellerValidation,
            });
          } else {
            const travellerDB = await models.Traveller.create(traveller, {
              transaction: t,
            });
          }
        }
        // -- Looping over flight info
        for (var i = 0; i < req.body.flightinfo.length; i++) {
          // -- Getting flight info
          const arrDate = req.body.flightinfo[i].arrivalDate.split("-");
          const depDate = req.body.flightinfo[i].departureDate.split("-");
          const flightinfo = {
            bookingId: bookingDB.id,
            arrivalAirline: req.body.flightinfo[i].arrivalAirline,
            arrivalFNb: req.body.flightinfo[i].arrivalFNb,
            arrivalDate: new Date(arrDate[0], arrDate[1] - 1, arrDate[2]),
            departureAirline: req.body.flightinfo[i].departureAirline,
            departureFNb: req.body.flightinfo[i].departureFNb,
            departureDate: new Date(depDate[0], depDate[1] - 1, depDate[2]),
            travellers: req.body.flightinfo[i].travellers,
          };
          // -- Validating data passed in request body for flight info
          const flightinfo_schema = {
            bookingId: { type: "number", optional: false },
            arrivalAirline: { type: "string", optional: false },
            arrivalFNb: { type: "string", optional: false },
            arrivalDate: { type: "date", optional: false },
            departureAirline: { type: "string", optional: false },
            departureFNb: { type: "string", optional: false },
            departureDate: { type: "date", optional: false },
            travellers: { type: "number", optional: false },
          };
          const vflightInfo = new Validator();
          const flightinfovalidation = vflightInfo.validate(
            flightinfo,
            flightinfo_schema
          );
          if (flightinfovalidation != true) {
            t.rollback();
            return res.status(406).json({
              message: "Error in flight info data",
              error: flightinfovalidation,
            });
          } else {
            // -- Inserting flightinfo
            const flightinfoDB = await models.FlightInfo.create(flightinfo, {
              transaction: t,
            });
          }
        }
        // -- If CCinfo available
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
          const vCCinfo = new Validator();
          const ccinfovalidation = vCCinfo.validate(ccinfo, ccinfo_schema);
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
            if (bookingDB.payed) {
              try {
                const callback = (response) => {
                  if (response == null) {
                    t.rollback();
                  }
                };
                chargeCreditCard(callback, CCinfoDB, bookingDB);
              } catch (error) {
                t.rollback();
              }
            }
          }
        }
      });
      // -- Responding with all data
      return res.status(201).json({ message: "success", result });
    } catch (error) {
      return res.status(500).json({
        message: "Server Error 123",
        error: error,
      });
    }
  }
};

// -- Get Booking
exports.getBooking = (req, res) => {
  // -- Get booking info
  models.Bookings.findOne({ where: { userId: req.userData.userId } })
    .then((booking) => {
      if (booking != null && booking.status) {
        let d1 = new Date();
        let d2 = new Date(booking.createdAt);
        if (d1.getDay() - d2.getDay() >= 2) {
          models.Bookings.update(
            { status: false },
            { where: { id: booking.id } }
          );
          res.status(200).json({ message: "Booking expired" });
        } else {
          // -- Get room info
          models.RoomBooking.findAll({ where: { bookingId: booking.id } })
            .then((rooms) => {
              booking["dataValues"]["rooms"] = rooms;
              // -- Get table info
              models.TableBooking.findAll({ where: { bookingId: booking.id } })
                .then((tables) => {
                  booking["dataValues"]["tables"] = tables;
                  // -- Get traveller info
                  models.Traveller.findAll({ where: { bookingId: booking.id } })
                    .then((travellers) => {
                      booking["dataValues"]["travellers"] = travellers;
                      // -- Get flight info
                      models.FlightInfo.findAll({
                        where: { bookingId: booking.id },
                      })
                        .then((flightinfo) => {
                          booking["dataValues"]["flightinfo"] = flightinfo;
                          res.status(200).json({ message: "success", booking });
                        })
                        .catch((error) =>
                          res
                            .status(500)
                            .json({ message: "Server Error", error })
                        );
                    })
                    .catch((error) =>
                      res.status(500).json({ message: "Server Error", error })
                    );
                })
                .catch((error) =>
                  res.status(500).json({ message: "Server Error", error })
                );
            })
            .catch((error) =>
              res.status(500).json({ message: "Server Error", error })
            );
        }
      } else if (!booking.status) {
        res.status(200).json({ message: "Booking expired" });
      } else {
        res.status(200).json({ message: "No booking" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Server Error", error });
    });
};
