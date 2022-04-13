const Validator = require("fastest-validator");
const { sequelize } = require("../models");
const models = require("../models");
const QRCode = require("qrcode");
const { chargeCreditCard } = require("../middlewares/chargeCreditCard");
const emails = require("../helpers/emails");
const uploadFile = require("./../middlewares/upload");
const uploadFileMiddleware = require("./../middlewares/upload");

// -- Create booking
exports.createBooking = async (req, res) => {
  var headerRes = true;
  if (req.userData.role == 1) {
    // -- Check for previous bookings
    models.Bookings.findOne({ where: { userId: req.userData.userId } }).then(
      (response) => {
        if (response) {
          if (headerRes) {
            headerRes = false;
            res.status(400).json({ message: "already has a booking" });
          }
        }
      }
    );
  }
  // -- Getting booking info
  const inDate = req.body.checkIn.split("-");
  const outDate = req.body.checkOut.split("-");
  const booking = {
    manuel: req.body.manuel,
    status: true,
    CC: req.body.CC,
    payed: req.body.payed,
    userId: req.userData.role == 1 ? req.userData.userId : req.body.userId,
    QrCode: "https://yallacyprus.com/receipt" + req.userData.userId,
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
    if (headerRes) {
      headerRes = false;
      return res.status(406).json({
        message: "Error in booking data",
        error: bookingValidation,
      });
    }
  } else {
    // -- Creating Transaction
    try {
      await sequelize.transaction(async (t) => {
        // -- Inserting booking info
        const bookingDB = await models.Bookings.create(booking, {
          transaction: t,
        });
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
            headerRes = false;
            return res.status(406).json({
              message: "Error in table data",
              error: tableValidation,
            });
          } else {
            models.TableBooking.create(table, {
              transaction: t,
            }).then(
              models.Table.increment("booked", {
                by: table.nbOfPeople,
                where: { id: table.tableId },
              }).catch((err) => t.rollback())
            );
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
            headerRes = false;
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
            headerRes = false;
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
            arrivalAirport: req.body.flightinfo[i].arrivalAirport,
            arrivalAirline: req.body.flightinfo[i].arrivalAirline,
            arrivalFNb: req.body.flightinfo[i].arrivalFNb,
            arrivalDate: new Date(arrDate[0], arrDate[1] - 1, arrDate[2]),
            departureAirpot: req.body.flightinfo[i].departureAirport,
            departureAirline: req.body.flightinfo[i].departureAirline,
            departureFNb: req.body.flightinfo[i].departureFNb,
            departureDate: new Date(depDate[0], depDate[1] - 1, depDate[2]),
            travellers: req.body.flightinfo[i].travellers,
          };
          // -- Validating data passed in request body for flight info
          const flightinfo_schema = {
            bookingId: { type: "number", optional: false },
            arrivalAirport: { type: "string", optional: false },
            arrivalAirline: { type: "string", optional: false },
            arrivalFNb: { type: "string", optional: false },
            arrivalDate: { type: "date", optional: false },
            departureAirpot: { type: "string", optional: false },
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
            headerRes = false;
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
            cardHolder: { type: "string", optional: true },
          };
          const vCCinfo = new Validator();
          const ccinfovalidation = vCCinfo.validate(ccinfo, ccinfo_schema);
          if (ccinfovalidation != true) {
            t.rollback();
            headerRes = false;
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
                    headerRes = false;
                    models.Bookings.update(
                      { payed: false },
                      { where: { id: bookingDB.id } }
                    );
                    return res.status(401).json({
                      message: "Payment Failed",
                    });
                  } else {
                    // -- Responding with all data
                    if (headerRes) {
                      emails.sendBookingConfirmationEmail(
                        req.userData.email,
                        bookingDB
                      );
                      emails.sendReceiptEmail(req.userData.email);
                      headerRes = false;
                      return res.status(201).json({ message: "success1" });
                    }
                  }
                };
                await chargeCreditCard(callback, CCinfoDB, bookingDB);
              } catch (error) {
                models.Bookings.update(
                  { payed: false },
                  { where: { id: bookingDB.id } }
                );
                if (headerRes) {
                  headerRes = false;
                  return res.status(401).json({
                    message: "Payment Failed",
                    error: error,
                  });
                }
              }
            } else {
              // -- Responding with all data
              if (headerRes) {
                emails.sendBookingConfirmationEmail(
                  req.userData.email,
                  bookingDB
                );
                headerRes = false;
                return res.status(201).json({ message: "success2" });
              }
            }
          }
        } else {
          // -- Responding with all data
          if (headerRes) {
            emails.sendBookingConfirmationEmail(req.userData.email, bookingDB);
            headerRes = false;
            return res.status(201).json({ message: "success3" });
          }
        }
      });
    } catch (error) {
      if (headerRes) {
        return res.status(500).json({
          message: "Server Error",
          error: error,
        });
      }
    }
  }
};

// -- Update Booking
exports.updateBooking = async (req, res) => {
  let headerRes = true;
  let updateResponse = [];
  // -- Table Bookings Update
  if (req.body.tableFlag) {
    //console.log(req.body.tablesOld);
    var i;
    for (i = 0; i < req.body.tablesOld.length; i++) {
      // -- Decrease Table Count
      models.Table.update(
        {
          booked: sequelize.literal(
            `booked - ${req.body.tablesOld[i].nbOfPeople}`
          ),
        },
        {
          where: {
            id: req.body.tablesOld[i].tableId,
          },
        }
      )
        .then((decResponse) => {
          if (decResponse) {
          } else {
            if (headerRes) {
              headerRes = false;
              return res.status(400).json({ message: "Error in decrement 1" });
            }
          }
        })
        .catch((error) => {
          if (headerRes) {
            headerRes = false;
            return res
              .status(400)
              .json({ message: "Error in decrement 2", error: error });
          }
        });
      // -- Delete Old Table Bookings
      models.TableBooking.destroy({
        where: {
          tableId: req.body.tablesOld[i].tableId,
          bookingId: req.body.bookingId,
        },
      })
        .then((desResponse) => {
          //console.log(desResponse);
          if (desResponse) {
          } else {
            if (headerRes) {
              headerRes = false;
              return res.status(400).json({
                message: "Error in deleting old bookings 2",
              });
            }
          }
        })
        .catch((error) => {
          if (headerRes) {
            headerRes = false;
            return res.status(400).json({
              message: "Error in deleting old bookings 1",
              error: error,
            });
          }
        });
    }
    if (i >= req.body.tablesOld.length) {
      models.Bookings.update(
        { nbOfTables: req.body.nbOfTables },
        {
          where: {
            id: req.body.bookingId,
          },
        }
      ).catch((error) => {
        if (headerRes) {
          headerRes = false;
          return res.status(400).json({
            message: "Error in udpating nb of tables",
            error: error,
          });
        }
      });
      for (var i = 0; i < req.body.tablesNew.length; i++) {
        // -- Create New Table Bookings
        const table = {
          tableId: req.body.tablesNew[i].tableId,
          bookingId: req.body.bookingId,
          nbOfPeople: req.body.tablesNew[i].nbOfPeople,
        };
        models.TableBooking.create(table)
          .then((createResponse) => {
            if (createResponse) {
              // -- Increase Table Count
              models.Table.increment("booked", {
                by: table.nbOfPeople,
                where: { id: table.tableId },
              })
                .then(() => {
                  //console.log("hi");
                  updateResponse.push("Table Bookings Updated Successfully");
                })
                .catch((error) => {
                  if (headerRes) {
                    headerRes = false;
                    return res.status(400).json({
                      message: "Error in increasing table count 2",
                      error: error,
                    });
                  }
                });
            } else {
              if (headerRes) {
                headerRes = false;
                return res.status(400).json({
                  message: "Error in creating new table bookings 1",
                });
              }
            }
          })
          .catch((error) => {
            if (headerRes) {
              headerRes = false;
              return res.status(400).json({
                message: "Error in creating new table bookings 2",
                error: error,
              });
            }
          });
      }
    }
  }

  // -- Travellers Update
  if (req.body.travellerFlag) {
    // -- Delete Old Travellers
    models.Traveller.destroy({ where: { id: req.body.bookingId } })
      .then(() => {
        // -- Add New Travellers
        for (var i = 0; i < req.body.travellers.length; i++) {
          const dobDate = req.body.travellers[i].dob.split("-");
          const traveller = {
            bookingId: req.body.bookingId,
            fullname: req.body.travellers[i].fullname,
            dob: new Date(dobDate[0], dobDate[1] - 1, dobDate[2]),
            nationality: req.body.travellers[i].nationality,
          };
          models.Traveller.create(traveller)
            .then(() => {
              updateResponse.push("Note Updated Successfully");
            })
            .catch((error) => {
              if (headerRes) {
                headerRes = false;
                return res.status(400).json({
                  message: "Error in creating new travellers",
                  error: error,
                });
              }
            });
        }
      })
      .catch((error) => {
        if (headerRes) {
          headerRes = false;
          return res
            .status(400)
            .json({ message: "Error in traveller destroy", error: error });
        }
      });
  }

  // -- Note Update
  if (req.body.noteFlag) {
    models.Bookings.update(
      { adminNote: req.body.note },
      { where: { id: req.body.bookingId } }
    )
      .then(() => {
        updateResponse.push("Note Updated Successfully");
      })
      .catch((error) => {
        if (headerRes) {
          headerRes = false;
          return res
            .status(400)
            .json({ message: "Error in note update", error: error });
        }
      });
  }

  // -- Coupon Id Update
  if (req.body.couponFlag) {
    models.Bookings.update(
      { couponId: req.body.couponId, total: req.body.total },
      { where: { id: req.body.bookingId } }
    )
      .then(() => {
        updateResponse.push("CouponID & Total Updated Successfully");
      })
      .catch((error) => {
        if (headerRes) {
          headerRes = false;
          return res
            .status(400)
            .json({ message: "Error in coupon update", error: error });
        }
      });
  }

  // -- Manual Total Update
  if (req.body.manuelFlag) {
    models.Bookings.update(
      { total: req.body.manualTotal },
      { where: { id: req.body.bookingId } }
    )
      .then(() => {
        updateResponse.push("Manual Total Updated Successfully");
      })
      .catch((error) => {
        if (headerRes) {
          headerRes = false;
          return res.status(400).json({
            message: "Error in manual total update",
            error: error,
          });
        }
      });
  }

  if (headerRes) {
    headerRes = false;
    res
      .status(200)
      .json({ message: "success", updateResponse: updateResponse });
  }
};

// -- Get Booking
exports.getBooking = (req, res) => {
  let headerRes = true;
  // -- Get booking info
  models.Bookings.findOne({ where: { userId: req.userData.userId } })
    .then((booking) => {
      if (booking != null && booking.status) {
        let d1 = new Date();
        let d2 = new Date(booking.createdAt);
        if (!booking.payed && d1.getDay() - d2.getDay() >= 2) {
          models.Bookings.update(
            { status: false },
            { where: { id: booking.id } }
          ).then(() => {
            models.TableBooking.findAll({
              where: { bookingId: booking.id },
            }).then((tables) => {
              for (var i = 0; i < tables.length; i++) {
                models.Table.update(
                  {
                    booked: sequelize.literal(`booked - 1`),
                  },
                  { where: { id: rooms.roomId } }
                );
              }
            });
            models.RoomBooking.findAll({
              where: { bookingId: booking.id },
            }).then((rooms) => {
              for (var i = 0; i < rooms.length; i++) {
                models.Room.update(
                  {
                    booked: sequelize.literal(`booked - ${tables.nbOfPeople}`),
                  },
                  { where: { id: tables.tableId } }
                );
              }
            });
          });
          if (headerRes) {
            headerRes = false;
            return res.status(200).json({ message: "Booking expired" });
          }
        } else {
          // -- Get user data
          models.User.findOne({ where: { id: req.userData.userId } })
            .then((user) => {
              booking["dataValues"]["user"] = user;
              // -- Get room info
              models.RoomBooking.findAll({ where: { bookingId: booking.id } })
                .then((rooms) => {
                  booking["dataValues"]["rooms"] = rooms;
                  // -- Get table info
                  models.TableBooking.findAll({
                    where: { bookingId: booking.id },
                  })
                    .then((tables) => {
                      booking["dataValues"]["tables"] = tables;
                      // -- Get traveller info
                      models.Traveller.findAll({
                        where: { bookingId: booking.id },
                      })
                        .then((travellers) => {
                          booking["dataValues"]["travellers"] = travellers;
                          // -- Get flight info
                          models.FlightInfo.findAll({
                            where: { bookingId: booking.id },
                          })
                            .then((flightinfo) => {
                              booking["dataValues"]["flightinfo"] = flightinfo;
                              if (headerRes) {
                                headerRes = false;
                                return res
                                  .status(200)
                                  .json({ message: "success", booking });
                              }
                            })
                            .catch((error) => {
                              if (headerRes) {
                                headerRes = false;
                                return res
                                  .status(500)
                                  .json({ message: "Server Error 1", error });
                              }
                            });
                        })
                        .catch((error) => {
                          if (headerRes) {
                            headerRes = false;
                            return res
                              .status(500)
                              .json({ message: "Server Error 2", error });
                          }
                        });
                    })
                    .catch((error) => {
                      if (headerRes) {
                        headerRes = false;
                        return res
                          .status(500)
                          .json({ message: "Server Error 3", error });
                      }
                    });
                })
                .catch((error) => {
                  if (headerRes) {
                    headerRes = false;
                    return res
                      .status(500)
                      .json({ message: "Server Error 4", error });
                  }
                });
            })
            .catch((error) => {
              if (headerRes) {
                headerRes = false;
                return res
                  .status(500)
                  .json({ message: "Server Error 0", error });
              }
            });
        }
      } else if (!booking.status) {
        if (headerRes) {
          headerRes = false;
          return res.status(200).json({ message: "Booking expired" });
        }
      } else {
        if (headerRes) {
          headerRes = false;
          return res.status(200).json({ message: "No booking" });
        }
      }
    })
    .catch((error) => {
      if (headerRes) {
        headerRes = false;
        return res.status(500).json({ message: "No booking", error });
      }
    });
};

// -- Get Booking Admin
exports.getBookingAdmin = (req, res) => {
  let headerRes = true;
  // -- Get booking info
  models.Bookings.findOne({
    where: { userId: req.params.userId, id: req.params.bookingId },
  })
    .then((booking) => {
      if (booking != null) {
        if (booking.status) {
          let d1 = new Date();
          let d2 = new Date(booking.createdAt);
          if (!booking.payed && d1.getDay() - d2.getDay() >= 2) {
            booking.status = false;
            models.Bookings.update(
              { status: false },
              { where: { id: booking.id } }
            ).then(() => {
              models.TableBooking.findAll({
                where: { bookingId: booking.id },
              }).then((tables) => {
                for (var i = 0; i < tables.length; i++) {
                  models.Table.update(
                    {
                      booked: sequelize.literal(`booked - 1`),
                    },
                    { where: { id: rooms.roomId } }
                  );
                }
              });
              models.RoomBooking.findAll({
                where: { bookingId: booking.id },
              }).then((rooms) => {
                for (var i = 0; i < rooms.length; i++) {
                  models.Room.update(
                    {
                      booked: sequelize.literal(
                        `booked - ${tables.nbOfPeople}`
                      ),
                    },
                    { where: { id: tables.tableId } }
                  );
                }
              });
            });
          }
        }
        // -- Get user data
        models.User.findOne({ where: { id: req.userData.userId } })
          .then((user) => {
            booking["dataValues"]["user"] = user;
            // -- Get room info
            models.RoomBooking.findAll({ where: { bookingId: booking.id } })
              .then((rooms) => {
                booking["dataValues"]["rooms"] = rooms;
                // -- Get table info
                models.TableBooking.findAll({
                  where: { bookingId: booking.id },
                })
                  .then((tables) => {
                    booking["dataValues"]["tables"] = tables;
                    // -- Get traveller info
                    models.Traveller.findAll({
                      where: { bookingId: booking.id },
                    })
                      .then((travellers) => {
                        booking["dataValues"]["travellers"] = travellers;
                        // -- Get flight info
                        models.FlightInfo.findAll({
                          where: { bookingId: booking.id },
                        })
                          .then((flightinfo) => {
                            booking["dataValues"]["flightinfo"] = flightinfo;
                            if (headerRes) {
                              headerRes = false;
                              return res
                                .status(200)
                                .json({ message: "success", booking });
                            }
                          })
                          .catch((error) => {
                            if (headerRes) {
                              headerRes = false;
                              return res
                                .status(500)
                                .json({ message: "Server Error 1", error });
                            }
                          });
                      })
                      .catch((error) => {
                        if (headerRes) {
                          headerRes = false;
                          return res
                            .status(500)
                            .json({ message: "Server Error 2", error });
                        }
                      });
                  })
                  .catch((error) => {
                    if (headerRes) {
                      headerRes = false;
                      return res
                        .status(500)
                        .json({ message: "Server Error 3", error });
                    }
                  });
              })
              .catch((error) => {
                if (headerRes) {
                  headerRes = false;
                  return res
                    .status(500)
                    .json({ message: "Server Error 4", error });
                }
              });
          })
          .catch((error) => {
            if (headerRes) {
              headerRes = false;
              return res.status(500).json({ message: "Server Error 0", error });
            }
          });
      } else {
        if (headerRes) {
          headerRes = false;
          return res.status(200).json({ message: "No booking" });
        }
      }
    })
    .catch((error) => {
      if (headerRes) {
        headerRes = false;
        return res.status(500).json({ message: "No booking", error });
      }
    });
};

// -- Create flightinfo
exports.addFlightInfo = (req, res) => {
  let headerRes = true;
  models.Bookings.findOne({
    where: { userId: req.body.userId, id: req.body.bookingId },
  })
    .then((result) => {
      if (result) {
        // -- Looping over flight info
        for (var i = 0; i < req.body.flightinfo.length; i++) {
          // -- Getting flight info
          const arrDate = req.body.flightinfo[i].arrivalDate.split("-");
          const depDate = req.body.flightinfo[i].departureDate.split("-");
          const flightinfo = {
            bookingId: req.body.bookingId,
            arrivalAirport: req.body.flightinfo[i].arrivalAirport,
            arrivalAirline: req.body.flightinfo[i].arrivalAirline,
            arrivalFNb: req.body.flightinfo[i].arrivalFNb,
            arrivalDate: new Date(arrDate[0], arrDate[1] - 1, arrDate[2]),
            departureAirpot: req.body.flightinfo[i].departureAirport,
            departureAirline: req.body.flightinfo[i].departureAirline,
            departureFNb: req.body.flightinfo[i].departureFNb,
            departureDate: new Date(depDate[0], depDate[1] - 1, depDate[2]),
            travellers: req.body.flightinfo[i].travellers,
          };
          // -- Validating data passed in request body for flight info
          const flightinfo_schema = {
            bookingId: { type: "number", optional: false },
            arrivalAirport: { type: "string", optional: false },
            arrivalAirline: { type: "string", optional: false },
            arrivalFNb: { type: "string", optional: false },
            arrivalDate: { type: "date", optional: false },
            departureAirpot: { type: "string", optional: false },
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
            headerRes = false;
            return res.status(406).json({
              message: "Error in flight info data",
              error: flightinfovalidation,
            });
          } else {
            // -- Inserting flightinfo
            models.FlightInfo.create(flightinfo).then(() => {
              if (headerRes) {
                headerRes = false;
                return res.status(200).json({ message: "success" });
              }
            });
          }
        }
      } else {
        if (headerRes) {
          headerRes = false;
          return res.status(401).json({ message: "Booking doesn't exist" });
        }
      }
    })
    .catch((error) => {
      if (headerRes) {
        return res.status(500).json({
          message: "Error in creating flight info",
          error: error,
        });
      }
    });
};

// -- Get All Bookings
exports.getBookingss = (req, res) => {
  let headerRes = true;
  //console.log("------------------------------------------------");
  models.Bookings.findAll({ where: { status: true } })
    .then((bookings) => {
      //console.log("Bookings: ", bookings);
      if (bookings) {
        for (var i = 0; i < bookings.length; i++) {
          if (bookings[i].status) {
            let d1 = new Date();
            let d2 = new Date(bookings[i].createdAt);
            if (!bookings[i].payed && d1.getDay() - d2.getDay() >= 2) {
              models.Bookings.update(
                { status: false },
                { where: { id: bookings[i].id } }
              ).then(() => {
                if (bookings[i]) {
                  bookings[i].status = false;
                }
                models.TableBooking.findAll({
                  where: { bookingId: bookings[i].id },
                }).then((tables) => {
                  for (var i = 0; i < tables.length; i++) {
                    models.Table.update(
                      {
                        booked: sequelize.literal(`booked - 1`),
                      },
                      { where: { id: rooms.roomId } }
                    );
                  }
                });
                models.RoomBooking.findAll({
                  where: { bookingId: bookings[i].id },
                }).then((rooms) => {
                  for (var i = 0; i < rooms.length; i++) {
                    models.Room.update(
                      {
                        booked: sequelize.literal(
                          `booked - ${tables.nbOfPeople}`
                        ),
                      },
                      { where: { id: tables.tableId } }
                    );
                  }
                });
              });
            }
          }
        }
        if (headerRes) {
          headerRes = false;
          res.status(200).json({ message: "success", bookings: bookings });
        }
      } else {
        if (headerRes) {
          headerRes = false;
          res.status(401).json({ message: "No Bookings" });
        }
      }
    })
    .catch((err) => {
      if (headerRes) {
        headerRes = false;
        res.status(500).json({ message: "server error", error: err });
      }
    });
};

// -- Create CC info
exports.payNow = (req, res) => {
  let headerRes = true;
  models.Bookings.findOne({
    where: { userId: req.body.userId, id: req.body.bookingId, payed: false },
  })
    .then((booking) => {
      if (booking) {
        // -- Getting ccinfo
        const ccinfo = {
          bookingId: req.body.bookingId,
          cardNumber: req.body.ccinfo.cardNumber,
          expirationDate: req.body.ccinfo.expirationDate,
          cardCode: req.body.ccinfo.cardCode,
          cardHolder: req.body.ccinfo.cardHolder,
        };
        if (req.body.couponFlag) {
          models.Bookings.update(
            { total: req.body.total, couponId: req.body.couponId },
            { where: { id: req.body.bookingId } }
          )
            .then(() => {
              booking.total = req.body.total;
            })
            .catch((err) => {});
        }
        if (req.body.CC) {
          // -- Validating data passed in request body for ccinfo
          const ccinfo_schema = {
            bookingId: { type: "number", optional: false },
            cardNumber: { type: "string", optional: false },
            expirationDate: { type: "string", optional: false },
            cardCode: { type: "number", optional: false },
            cardHolder: { type: "string", optional: true },
          };
          const vCCinfo = new Validator();
          const ccinfovalidation = vCCinfo.validate(ccinfo, ccinfo_schema);
          if (ccinfovalidation != true) {
            if (headerRes) {
              headerRes = false;
              return res.status(406).json({
                message: "Error in credit card data",
                error: ccinfovalidation,
              });
            }
          } else {
            // -- Inserting CCinfo
            models.CCinfo.create(ccinfo)
              .then(() => {
                if (headerRes) {
                  headerRes = false;
                  return res.status(200).json({ message: "success" });
                }
              })
              .then(() => {
                models.Bookings.update(
                  { CC: true },
                  { where: { userId: req.body.userId, id: req.body.bookingId } }
                );
              });
          }
        }
        const callback = (response) => {
          if (response == null) {
            if (headerRes) {
              headerRes = false;
              return res.status(401).json({
                message: "Payment Failed",
              });
            }
          } else {
            models.Bookings.update(
              { payed: true },
              { where: { userId: req.body.userId, id: req.body.bookingId } }
            );
            // -- Responding with all data
            emails.sendReceiptEmail(req.userData.email);
            if (headerRes) {
              headerRes = false;
              return res.status(201).json({ message: "success" });
            }
          }
        };
        chargeCreditCard(callback, ccinfo, booking);
      } else {
        if (headerRes) {
          headerRes = false;
          return res.status(401).json({ message: "Booking doesn't exist" });
        }
      }
    })
    .catch((error) => {
      if (headerRes) {
        return res.status(500).json({
          message: "Error in paying",
          error: error,
        });
      }
    });
};

// -- Pay Cash
exports.payCash = (req, res) => {
  models.Bookings.update(
    { payed: true, adminNote: req.body.note },
    { where: { id: req.body.bookingId } }
  )
    .then(() => {
      emails.sendReceiptEmail(req.body.userEmail);
      res.status(200).json({ message: "success" });
    })
    .catch((error) => {
      res.status(400).json({ message: "failed" });
    });
};

// -- QR Code Receipt
exports.getFromQR = (req, res) => {
  let headerRes = true;
  // -- Get booking info
  models.Bookings.findOne({
    where: { userId: req.params.userId, id: req.params.bookingId },
  })
    .then((booking) => {
      if (booking != null) {
        if (booking.status) {
          let d1 = new Date();
          let d2 = new Date(booking.createdAt);
          if (!booking.payed && d1.getDay() - d2.getDay() >= 2) {
            booking.status = false;
            models.Bookings.update(
              { status: false },
              { where: { id: booking.id } }
            ).then(() => {
              models.TableBooking.findAll({
                where: { bookingId: booking.id },
              }).then((tables) => {
                for (var i = 0; i < tables.length; i++) {
                  models.Table.update(
                    {
                      booked: sequelize.literal(`booked - 1`),
                    },
                    { where: { id: rooms.roomId } }
                  );
                }
              });
              models.RoomBooking.findAll({
                where: { bookingId: booking.id },
              }).then((rooms) => {
                for (var i = 0; i < rooms.length; i++) {
                  models.Room.update(
                    {
                      booked: sequelize.literal(
                        `booked - ${tables.nbOfPeople}`
                      ),
                    },
                    { where: { id: tables.tableId } }
                  );
                }
              });
            });
          }
        }
        // -- Get user data
        models.User.findOne({ where: { id: req.userData.userId } })
          .then((user) => {
            booking["dataValues"]["user"] = user;
            // -- Get room info
            models.RoomBooking.findAll({ where: { bookingId: booking.id } })
              .then((rooms) => {
                booking["dataValues"]["rooms"] = rooms;
                // -- Get table info
                models.TableBooking.findAll({
                  where: { bookingId: booking.id },
                })
                  .then((tables) => {
                    booking["dataValues"]["tables"] = tables;
                    // -- Get traveller info
                    models.Traveller.findAll({
                      where: { bookingId: booking.id },
                    })
                      .then((travellers) => {
                        booking["dataValues"]["travellers"] = travellers;
                        // -- Get flight info
                        models.FlightInfo.findAll({
                          where: { bookingId: booking.id },
                        })
                          .then((flightinfo) => {
                            booking["dataValues"]["flightinfo"] = flightinfo;
                            if (headerRes) {
                              headerRes = false;
                              return res
                                .status(200)
                                .json({ message: "success", booking });
                            }
                          })
                          .catch((error) => {
                            if (headerRes) {
                              headerRes = false;
                              return res
                                .status(500)
                                .json({ message: "Server Error 1", error });
                            }
                          });
                      })
                      .catch((error) => {
                        if (headerRes) {
                          headerRes = false;
                          return res
                            .status(500)
                            .json({ message: "Server Error 2", error });
                        }
                      });
                  })
                  .catch((error) => {
                    if (headerRes) {
                      headerRes = false;
                      return res
                        .status(500)
                        .json({ message: "Server Error 3", error });
                    }
                  });
              })
              .catch((error) => {
                if (headerRes) {
                  headerRes = false;
                  return res
                    .status(500)
                    .json({ message: "Server Error 4", error });
                }
              });
          })
          .catch((error) => {
            if (headerRes) {
              headerRes = false;
              return res.status(500).json({ message: "Server Error 0", error });
            }
          });
      } else {
        if (headerRes) {
          headerRes = false;
          return res.status(200).json({ message: "No booking" });
        }
      }
    })
    .catch((error) => {
      if (headerRes) {
        headerRes = false;
        return res.status(500).json({ message: "No booking", error });
      }
    });
};

// -- Send Receipt Email
exports.sendReceiptEmail = async (req, res) => {
  try {
    await uploadFileMiddleware(req, res);
    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (err) {
    res.status(500).send({
      message: `Could not upload the file: ${req.file}. ${err}`,
    });
  }
};
