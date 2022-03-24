const models = require("./../models");
const Validator = require("fastest-validator");

// -- Create Referal
exports.createReferal = (req, res) => {
  const referal = { referalName: req.body.referalName, count: 0 };
  const referal_schema = {
    referalName: { type: "string", optional: false },
    count: { type: "number", optional: false },
  };
  const v = new Validator();
  const vValidation = v.validate(referal, referal_schema);
  if (vValidation != true) {
    headerRes = false;
    return res.status(406).json({
      message: "Error in referal data",
      error: vValidation,
    });
  } else {
    models.Referal.create(referal)
      .then((referal) => {
        res.status(200).json({ message: "success", referal: referal });
      })
      .catch((err) => res.status(500).json({ message: "Server Error" }));
  }
};

// -- Get Referals
exports.getReferals = (req, res) => {
  models.Referal.findAll()
    .then((referals) =>
      res.status(200).json({ message: "success", referals: referals })
    )
    .catch((err) => res.status(500).json({ message: "Server Error" }));
};

// -- Delete Referal
exports.deleteReferal = (req, res) => {
  models.Referal.destroy({ where: { id: req.params.id } })
    .then(() => res.status(200).json({ message: "success" }))
    .catch((err) => res.status(500).json({ message: "Server Error" }));
};
