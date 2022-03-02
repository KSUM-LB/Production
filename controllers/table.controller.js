const Validator = require("fastest-validator");
const models = require("./../models");

// -- Create new table
exports.createTable = (req, res) => {
  const table = {
    tableNb: req.body.tableNb,
    type: req.body.type,
    shape: req.body.shape,
    size: req.body.size,
    booked: req.body.booked,
    note: req.body.note,
  };
  const table_schema = {
    tableNb: { type: "number", optional: false },
    type: { type: "string", optional: false },
    shape: { type: "string", optional: true, default: "rectangle" },
    size: { type: "number", optional: false },
    booked: { type: "number", optional: true, default: 0 },
    note: { type: "string", optional: true },
  };
  const v = new Validator();
  const validationResponse = v.validate(table, table_schema);
  if (validationResponse != true) {
    return res.status(406).json({
      message: "Error in Data format",
      error: validationResponse,
    });
  } else {
    models.Table.create(table)
      .then((result) =>
        res.status(201).json({
          message: "Table created successfully",
          table: result,
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

// -- Get all tables
exports.getTables = (req, res) => {
  models.Table.findAll()
    .then((tables) => {
      res.status(200).json({
        tables,
      });
    })
    .catch((err) =>
      res.status(500).json({
        message: "Server Error",
        error: err,
      })
    );
};

// -- Edit Size
exports.editSize = (req, res) => {
  models.Table.update(
    { size: req.body.size },
    { where: { tableNb: req.body.tableNb } }
  )
    .then((result) => {
      if (result)
        res.status(201).json({
          message: "success",
          result,
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

// -- Edit Note
exports.editNote = (req, res) => {
  models.Table.update(
    { note: req.body.note },
    { where: { tableNb: req.body.tableNb } }
  )
    .then((result) => {
      if (result)
        res.status(201).json({
          message: "success",
          result,
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
