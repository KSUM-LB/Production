const jwt = require("jsonwebtoken");
const models = require("./../models");

// --- Verify that the token is true
exports.checkBooking = (req, res, next) => {
  let headerRes = true;
  models.Bookings.findOne({ where: { userId: req.userData.userId } })
    .then((booking) => {
      console.log("boking: " + booking);
      if ((req.userData.role == 1) && !booking["dataValues"]["status"]) {
        headerRes = false;
        res.status(401).json({ message: "User already has a booking" });
      } else {
        next();
      }
    })
    .catch((error) => {
      next();
    });
};
