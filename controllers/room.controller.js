const Validator = require("fastest-validator");
const models = require("./../models");

// -- Create new room
exports.createRoom = (req, res) => {
  const room = {
    type: req.body.type,
    name: req.body.name,
    maxSize: req.body.maxSize,
    quantity: req.body.quantity,
    booked: req.body.booked,
    singlePrice: req.body.singlePrice,
    couplePrice: req.body.couplePrice,
  };
  const room_schema = {
    type: { type: "string", optional: false },
    name: { type: "string", optional: false },
    maxSize: { type: "number", optional: false },
    quantity: { type: "number", optional: true, default: 0 },
    booked: { type: "number", optional: true, default: 0 },
    singlePrice: { type: "number", optional: false },
    couplePrice: { type: "number", optional: false },
  };
  const v = new Validator();
  const validationResponse = v.validate(room, room_schema);
  if (validationResponse != true) {
    return res.status(406).json({
      message: "Error in Data format",
      error: validationResponse,
    });
  } else {
    models.Room.create(room)
      .then((result) =>
        res.status(201).json({
          message: "Room created successfully",
          room: result,
        })
      )
      .catch((err) =>
        res.status(500).json({
          message: "Server Error",
          error: err,
        })
      );
  }
};

// -- Get all rooms
exports.getRooms = (req, res) => {
  models.Room.findAll()
    .then((rooms) => {
      res.status(200).json({
        rooms,
      });
    })
    .catch((err) =>
      res.status(500).json({
        message: "Server Error",
        error: err,
      })
    );
};

// -- Sales Report
exports.roomsReport = (req, res) => {
  let headerRes = true;
  const response = [];
  models.Room.findAll()
    .then((rooms) => {
      if(rooms != null) {
        for(var i=0; i<rooms.length; i++){
          response.push({
            roomId: rooms[i].id,
            quantity: rooms[i].quantity,
            booked: rooms[i].booked
          });
        }
        if(headerRes){
          headerRes = false;
          return res.status(200).json({message: "success", report: response});
        }
      } else {
        if (headerRes) {
          headerRes = false;
          return res.status(401).json({ message: "error fetching room data" });
        }
      }
    })
    .catch((err) => {
      if (headerRes) {
        return res.status(401).json({ message: "error fetching data" });
      }
    });
};

// -- Edit quantity
exports.editQuantity = (req, res) => {
  const value = req.body.action == "increase" ? parseInt("1") : parseInt("-1");
  models.Room.increment("quantity", {
    by: value,
    where: { id: req.body.roomId },
  })
    .then((result) => {
      if (result)
        res.status(201).json({
          message: "success",
        });
      else
        res.status(401).json({
          message: "error",
        });
    })
    .catch((err) =>
      res.status(500).json({
        message: "Server Error",
        error: err,
      })
    );
};

// exports.editQuantity = (req, res) => {
//   let headerRes = true;
//   for (var i = 0; i < req.body.rooms; i++) {
//     models.Room.findOne({ where: { id: req.body.rooms[i].roomId } })
//       .then((room) => {
//         if (room.booked <= req.body.rooms[i].quantity) {
//           models.Room.update(
//             { quantity: req.body.rooms[i].quantity },
//             { where: { id: req.body.rooms[i].roomId } }
//           ).catch((err) => {
//             if (headerRes) {
//               headerRes = false;
//               return res
//                 .status(401)
//                 .json({ message: "error in updating room quantity" });
//             }
//           });
//         } else {
//           if (headerRes) {
//             headerRes = false;
//             return res
//               .status(401)
//               .json({ message: "Quantity can't be less than booked" });
//           }
//         }
//       })
//       .catch((err) => {
//         if (headerRes) {
//           headerRes = false;
//           return res.status(401).json({ message: "error in finding room" });
//         }
//       });
//   }
//   if(headerRes){
//     return res.status(200).json({message: "All rooms updated successfully"});
//   }
// };
