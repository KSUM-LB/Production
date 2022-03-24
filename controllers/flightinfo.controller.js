const Validator = require("fastest-validator");
const { head } = require("../routes/user.router");
const models = require("./../models");

// -- Create Flight Info Email
exports.createFlightInfoEmail = (req, res) => {
  let headerRes = true;
  if (req.body.emails && req.body.emails.length > 0) {
    for (var i = 0; i < req.body.emails.length; i++) {
      const flightInfoEmail_schema = {
        email: { type: "string", optional: false },
      };
      const flightInfoEmail = {
        email: req.body.emails[i],
      };
      const v = new Validator();
      const validationResponse = v.validate(
        flightInfoEmail,
        flightInfoEmail_schema
      );
      if (validationResponse != true) {
        if (headerRes) {
          headerRes = false;
          res.status(406).json({
            message: "Error in Data format",
            error: validationResponse,
          });
        }
      } else {
        models.flightInfoEmails
          .create(flightInfoEmail)
          .then((result) => {
            if (!result) {
                if (headerRes) {
                    headerRes = false;
                    res.status(401).json({ message: "Failed to add" });
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
    if(headerRes) {
        headerRes = false;
        res.status(200).json({message: "success"});
    }
  } else {
      res.status(401).json({message: "No emails"});
  }
};

// -- Get Flight Info Emails
exports.getFlightInfoEmails = (req, res) => {
  let headerRes = true;
  models.flightInfoEmails
    .findAll()
    .then((result) => {
      if (result) {
        if (headerRes) {
          headerRes = false;
          res.status(200).json({ message: "success", result });
        }
      } else {
        if (headerRes) {
          headerRes = false;
          res.status(401).json({ message: "No Flight Info Emails" });
        }
      }
    })
    .catch((err) =>
      res.status(500).json({
        message: "Server Error",
        error: err,
      })
    );
};

// -- Delete Flight Info Email
exports.deleteFlightInfoEmail = (req, res) => {
  models.flightInfoEmails
    .destroy({ where: { id: req.params.id } })
    .then((result) => {
     if(result) {
        res.status(200).json({message: result});
     } else {
        res.status(401).json({message: "no email with this ID"});
     }
    })
    .catch((err) =>
      res.status(500).json({
        message: "Server Error",
        error: err,
      })
    );
};
