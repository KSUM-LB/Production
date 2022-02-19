const Validator = require("fastest-validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const models = require("./../models");

// -- Signup
exports.signup = (req, res) => {
  // -- Check if email is already used
  models.User.findOne({ where: { email: req.body.email } })
    .then((result) => {
      if (result) res.status(400).json({ message: "Email already exists" });
      else {
        // -- Hash password using bcryptjs
        bcryptjs.genSalt(10, (err, salt) => {
          if (err) {
            res.status(500).json({
              message: "Server Error",
              error: err,
            });
          } else {
            bcryptjs.hash(req.body.password, salt, (err, hash) => {
              if (err) {
                res.status(500).json({
                  message: "Server Error",
                  error: err,
                });
              } else {
                const user = {
                  fullName: req.body.fullName,
                  email: req.body.email,
                  password: hash,
                  phoneNb: req.body.phoneNb,
                };
                // -- Validating data passed in request body
                const user_schema = {
                  fullName: { type: "string", optional: false },
                  email: { type: "string", optional: false },
                  password: { type: "string", optional: false },
                  phoneNb: { type: "string", optional: true },
                };
                const v = new Validator();
                const validationResponse = v.validate(user, user_schema);
                if (validationResponse != true) {
                  return res.status(406).json({
                    message: "Error in Data format",
                    error: validationResponse,
                  });
                } else {
                  // -- Add new user to database
                  models.User.create(user)
                    .then((result) => {
                      res.status(201).json({
                        message: "User created successfully",
                        user: result,
                      });
                    })
                    .catch((err) => {
                      res.status(500).json({
                        message: "Server Error",
                        error: err,
                      });
                    });
                }
              }
            });
          }
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Server Error",
        error: err,
      });
    });
};

// -- Login
exports.login = (req, res) => {
  // -- Find user with the given email
  models.User.findOne({ where: { email: req.body.email } })
    .then((user) => {
      if (user == null) {
        res.status(401).json({ message: "Invalid email address" });
      } else {
        // -- Check if passwords match
        bcryptjs.compare(req.body.password, user.password, (err, result) => {
          if (err) {
            res.status(500).json({
              message: "Server Error",
              error: err,
            });
          }
          if (result) {
            // -- Delete any previous token
            models.Token.destroy({ where: { userId: user.id } })
              .then((result) => {
                // -- Create new token
                const jwtToken = jwt.sign(
                  { email: user.email, userId: user.id, role: user.roleId },
                  process.env.JWT_KEY,
                  (err, token) => {
                    if (err) {
                      res.status(500).json({
                        message: "Server Error",
                        error: err,
                      });
                    } else {
                      // -- Save new token in database
                      const tokenObject = {
                        userId: user.id,
                        token: token,
                      };
                      models.Token.create(tokenObject)
                        .then((result) => {
                          res.status(200).json({
                            message: "Logged in succesfully",
                            token: token,
                            role: user.roleId,
                          });
                        })
                        .catch((err) => {
                          res.status(500).json({
                            message: "Server Error",
                            error: err,
                          });
                        });
                    }
                  }
                );
              })
              .catch((err) => {
                res.status(500).json({
                  message: "Server Error",
                  error: err,
                });
              });
          } else {
            res.status(401).json({ message: "Invalid password" });
          }
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Server Error",
        error: err,
      });
    });
};

// -- Change password
exports.changePassword = (req, res) => {
  const userEmail = req.userData.email;
  models.User.findOne({ where: { email: userEmail } })
    .then((user) => {
      bcryptjs.compare(req.body.oldPassword, user.password, (err, result) => {
        if (err) {
          res.status(500).json({
            message: "Server Error",
            error: err,
          });
        } else if (result) {
          models.User.update(
            { password: req.body.newPassword },
            { where: { email: req.userData.email } }
          )
            .then((result) => {
                res.status(201).json({message: "Success"});
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Server Error",
                    error: err,
                  });
            });
        } else {
          res.status(401).json({ message: "Old password is incorrect" });
        }
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Server Error",
        error: err,
      });
    });
};

// -- Get User Info
exports.getUserInfo = (req, res) => {};

// -- Logout
exports.logout = (req, res) => {
  const jwtToken = req.headers.authorization.split(" ")[1];
  // --- Delete token record from database
  models.Token.destroy({ where: { token: jwtToken } })
    .then((result) => {
      if (result == null) {
        res.status(401).json({
          message: "Invalid or expired token",
        });
      } else {
        res.status(200).json({
          message: "Success",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Server error!",
        error,
      });
    });
};
