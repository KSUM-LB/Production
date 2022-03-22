const models = require("./../models");

// -- Create Referal
exports.createReferal = (req, res) => {
  models.Referal.create({ referalName: req.body.referal })
    .then((referal) => {
      res.status(200).json({ message: "success", referal: referal });
    })
    .catch((err) => res.status(500).json({ message: "Server Error" }));
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
