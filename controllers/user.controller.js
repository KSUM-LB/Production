const Validator = require("fastest-validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const models = require("./../models");

// -- Signup
exports.signup = (req, res) => {
  let headerRes = true;
  let roleId = 1;
  // -- Check if email is already used
  models.User.findOne({ where: { email: req.body.email } })
    .then((result) => {
      if (result) {
        if (headerRes) {
          headerRes = false;
          res.status(400).json({ message: "Email already exists" });
        }
      } else {
        try {
          const jwtToken = req.headers.authorization.split(" ")[1];
          const decodedToken = jwt.verify(jwtToken, process.env.JWT_KEY);
          models.Token.findOne({ where: { token: jwtToken } }).then(
            (result) => {
              if (result != null) {
                if (decodedToken.role == 3 || decodedToken.role == 4) {
                  roleId = 2;
                }
              }
            }
          );
        } catch (e) {
          roleId = 1;
        }
        // -- Hash password using bcryptjs
        bcryptjs.genSalt(10, (err, salt) => {
          if (err) {
            if (headerRes) {
              headerRes = false;
              res.status(500).json({
                message: "Server Error 1",
                error: err,
              });
            }
          } else {
            bcryptjs.hash(req.body.password, salt, (err, hash) => {
              if (err) {
                if (headerRes) {
                  headerRes = false;
                  res.status(500).json({
                    message: "Server Error 2",
                    error: err,
                  });
                }
              } else {
                const user = {
                  fullName: req.body.fullName,
                  email: req.body.email,
                  password: hash,
                  phoneNb: req.body.phoneNb,
                  roleId: roleId,
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
                  if (headerRes) {
                    headerRes = false;
                    res.status(406).json({
                      message: "Error in Data format",
                      error: validationResponse,
                    });
                  }
                } else {
                  // -- Add new user to database
                  models.User.create(user)
                    .then((result) => {
                      if (
                        req.body.referalId != null &&
                        req.body.referalId != undefined
                      ) {
                        models.Referal.increment("count", {
                          by: 1,
                          where: { id: req.body.referalId },
                        })
                          .then(() => {
                            if (headerRes) {
                              headerRes = false;
                              res.status(201).json({
                                message: "User created successfully",
                                user: result,
                              });
                            }
                          })
                          .catch((err) => {
                            if (headerRes) {
                              headerRes = false;
                              res.status(401).json({
                                message: "Incorrect referal ID",
                                error: err,
                              });
                            }
                          });
                      } else {
                        if (headerRes) {
                          headerRes = false;
                          res.status(201).json({
                            message: "User created successfully",
                            user: result,
                          });
                        }
                      }
                    })
                    .catch((err) => {
                      if (headerRes) {
                        headerRes = false;
                        res.status(500).json({
                          message: "Server Error",
                          error: err,
                        });
                      }
                    });
                }
              }
            });
          }
        });
      }
    })
    .catch((err) => {
      if (headerRes) headerRes = false;
      res.status(500).json({
        message: "Server Error",
        error: err,
      });
    });
};

// -- Login
exports.login = (req, res) => {
  let headerRes = true;
  // -- Find user with the given email
  models.User.findOne({ where: { email: req.body.email } })
    .then((user) => {
      if (user == null) {
        if (headerRes) {
          headerRes = false;
          res.status(401).json({ message: "Invalid email address" });
        }
      } else {
        // -- Check if passwords match
        bcryptjs.compare(req.body.password, user.password, (err, result) => {
          if (err) {
            if (headerRes) {
              headerRes = false;
              res.status(500).json({
                message: "Server Error",
                error: err,
              });
            }
          }
          if (result && user.status != "deleted") {
            // -- Delete any previous token
            models.Token.destroy({ where: { userId: user.id } })
              .then((result) => {
                // -- Create new token
                const jwtToken = jwt.sign(
                  { email: user.email, userId: user.id, role: user.roleId },
                  process.env.JWT_KEY,
                  (err, token) => {
                    if (err) {
                      if (headerRes) {
                        headerRes = false;
                        res.status(500).json({
                          message: "Server Error",
                          error: err,
                        });
                      }
                    } else {
                      // -- Save new token in database
                      const tokenObject = {
                        userId: user.id,
                        token: token,
                      };
                      models.Token.create(tokenObject)
                        .then((result) => {
                          if (headerRes) {
                            headerRes = false;
                            res.status(200).json({
                              message: "Logged in succesfully",
                              token: token,
                              role: user.roleId,
                            });
                          }
                        })
                        .catch((err) => {
                          if (headerRes) {
                            headerRes = false;
                            res.status(500).json({
                              message: "Server Error",
                              error: err,
                            });
                          }
                        });
                    }
                  }
                );
              })
              .catch((err) => {
                if (headerRes) {
                  headerRes = false;
                  res.status(500).json({
                    message: "Server Error",
                    error: err,
                  });
                }
              });
          } else {
            if (headerRes) {
              headerRes = false;
              res.status(401).json({ message: "Invalid password" });
            }
          }
        });
      }
    })
    .catch((err) => {
      if (headerRes) {
        headerRes = false;
        res.status(500).json({
          message: "Server Error",
          error: err,
        });
      }
    });
};

// -- Change password
exports.changePassword = (req, res) => {
  let headerRes = true;
  const userId = req.userData.userId;
  models.User.findOne({ where: { id: userId } })
    .then((user) => {
      console.log("111111111");
      bcryptjs.compare(req.body.oldPassword, user.password, (err, result) => {
        console.log("222222222222222");
        if (err) {
          if (headerRes) {
            console.log("33333333333333333333");
            headerRes = false;
            return res.status(500).json({
              message: "Server Error",
              error: err,
            });
          }
        } else if (result) {
          console.log("4444444444444444");
          bcryptjs.genSalt(10, (err, salt) => {
            console.log("5555555555555555555555555");
            if (err) {
              console.log("66666666666666");
              if (headerRes) {
                headerRes = false;
                return res.status(500).json({
                  message: "Server Error",
                  error: err,
                });
              }
            } else {
              console.log("77777777777777");
              bcryptjs.hash(req.body.newPassword, salt, (err, hash) => {
                if (err) {
                  if (headerRes) {
                    headerRes = false;
                    return res.status(500).json({
                      message: "Server Error",
                      error: err,
                    });
                  }
                } else {
                  models.User.update(
                    { password: hash },
                    { where: { id: req.userData.userId } }
                  )
                    .then((result) => {
                      if (headerRes) {
                        headerRes = false;
                        return res.status(201).json({ message: "Success" });
                      }
                    })
                    .catch((err) => {
                      if (headerRes) {
                        headerRes = false;
                        return res.status(500).json({
                          message: "Server Error",
                          error: err,
                        });
                      }
                    });
                }
              });
            }
          });
        } else {
          if (headerRes) {
            headerRes = false;
            return res
              .status(401)
              .json({ message: "Old password is incorrect" });
          }
        }
      });
    })
    .catch((err) => {
      if (headerRes) {
        headerRes = false;
        res.status(500).json({
          message: "Server Error",
          error: err,
        });
      }
    });
};

// -- Logout
exports.logout = (req, res) => {
  let headerRes = true;
  const jwtToken = req.headers.authorization.split(" ")[1];
  // --- Delete token record from database
  models.Token.destroy({ where: { token: jwtToken } })
    .then((result) => {
      if (result == null) {
        if (headerRes) {
          headerRes = false;
          res.status(401).json({
            message: "Invalid or expired token",
          });
        }
      } else {
        if (headerRes) {
          headerRes = false;
          res.status(200).json({
            message: "Success",
          });
        }
      }
    })
    .catch((error) => {
      if (headerRes) {
        headerRes = false;
        res.status(500).json({
          message: "Server error!",
          error,
        });
      }
    });
};

// -- Delete User
exports.deleteUser = (req, res) => {
  models.User.update({ status: "deleted" }, { where: { id: req.params.id } })
    .then(res.status(200).json({ message: "success" }))
    .catch(res.status(500).json({ message: "server error" }));
};

// -- Get Sub Users
exports.getUsers = (req, res) => {
  let headerRes = true;
  models.User.findAll({ where: { roleId: 2, status: "pending" } })
    .then((accounts) => {
      if (accounts) {
        if (headerRes) {
          headerRes = false;
          res.status(200).json({ message: "success", accounts: accounts });
        }
      } else {
        if (headerRes) {
          headerRes = false;
          res.status(401).json({ message: "no users" });
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

// Ger user info
exports.getUserInfo = (req, res) => {
  let headerRes = true;
  models.User.findOne({ where: { id: req.params.id } })
    .then((user) => {
      if (user) {
        if (headerRes) {
          headerRes = false;
          res.status(200).json({ message: "success", user: user });
        }
      } else {
        if (headerRes) {
          headerRes = false;
          res.status(401).json({ message: "no user" });
        }
      }
    })
    .catch((err) => {
      if (headerRes) {
        res.status(500).json({ message: "Error" });
      }
    });
};
