const jwt = require("jsonwebtoken");
const models = require("./../models");

// --- Verify that the token is true
exports.verifyAndDecode = (req, res, next) => {
  try {
    const jwtToken = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(jwtToken, process.env.JWT_KEY);
    models.Token.findOne({ where: { token: jwtToken } })
      .then((result) => {
        if (result == null) {
          return res.status(401).json({
            message: "Invalid or expired token"
          });
        } else {
          req.userData = decodedToken;
          next();
        }
      })
      .catch((err) => {
        return res.status(500).json({
          message: "Server error!",
          error: err,
        });
      });
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: err,
    });
  }
};
