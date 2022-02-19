const Validator = require("fastest-validator");
const models = require("./../models");

// -- Create Coupon
exports.createCoupon = (req, res) => {
  const coupon_schema = {
    name: { type: "string", optional: false },
    discount: { type: "number", optional: false },
    type: { type: "string", optional: false },
    expDate: { type: "date", optional: false },
    status: { type: "boolean", optional: true },
  };
  const date = req.body.expDate.split("-");
  const coupon = {
    name: req.body.name,
    discount: req.body.discount,
    type: req.body.type,
    expDate: new Date(date[0], date[1] - 1, date[2]),
    status: true,
  };
  const v = new Validator();
  const validationResponse = v.validate(coupon, coupon_schema);
  if (validationResponse != true) {
    return res.status(406).json({
      message: "Error in Data format",
      error: validationResponse,
    });
  } else {
    models.Coupon.create(coupon)
      .then((result) => {
        if (result)
          res.status(201).json({
            message: "Coupon created successfully",
          });
        else res.status(401).json({ error: "error" });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Server Error",
          error: err,
        });
      });
  }
};

// -- Get Coupons
exports.getCoupons = (req, res) => {
  models.Coupon.findAll({where: {status: 1}})
    .then((result) => res.send(result))
    .catch((err) =>
      res.status(500).json({
        message: "Server Error",
        error: err,
      })
    );
};

// -- Delete Coupon
exports.deleteCoupon = (req, res) => {
  models.Coupon.update({ status: 0 }, { where: { id: req.params.id } })
    .then((result) => {
      res.send(result);
    })
    .catch((err) =>
      res.status(500).json({
        message: "Server Error",
        error: err,
      })
    );
};
