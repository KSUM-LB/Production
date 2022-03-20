const Validator = require("fastest-validator");
const { head } = require("../routes/user.router");
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

// -- Edit Table
exports.editTable = (req, res) => {
  let headerRes = true;
  models.Table.findOne({ where: { id: req.body.tableId } })
    .then((table) => {
      if (table) {
        if (req.body.booked >= table.booked && req.body.booked <= table.size) {
          models.Table.update(
            { note: req.body.note, booked: req.body.booked },
            { where: { id: req.body.tableId } }
          )
            .then((result) => {
              if (result)
                if (headerRes) {
                  headerRes = false;
                  return res.status(201).json({
                    message: "success",
                    result,
                  });
                } else if (result) {
                  headerRes = false;
                  return res.status(401).json({
                    message: "error",
                  });
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
        } else {
          if (headerRes) {
            headerRes = false;
            return res.status(401).json({ message: "Unaccepted booked value" });
          }
        }
      } else {
        if (headerRes) {
          headerRes = false;
          return res.status(401).json({ message: "No such table" });
        }
      }
    })
    .catch((err) => {
      if (headerRes) {
        headerRes = false;
        return res.status(500).json({ message: "error fetching", err });
      }
    });
};

// -- Sales Report
exports.tablesReport = (req, res) => {
  let headerRes = true;
  let response = {
    deluxePlatinum: {
      type: "deluxePlatinum",
      quantity: 0,
      seats: 0,
      bookedSeats: 0
    },
    deluxeDiamond: {
      type: "deluxeDiamond",
      quantity: 0,
      seats: 0,
      bookedSeats: 0
    },
    standardGold: {
      type: "standardGold",
      quantity: 0,
      seats: 0,
      bookedSeats: 0
    },
    standardSilver: {
      type: "standardSilver",
      quantity: 0,
      seats: 0,
      bookedSeats: 0
    },
    familyRegular: {
      type: "familyRegular",
      quantity: 0,
      seats: 0,
      bookedSeats: 0
    },
    familyBasic: {
      type: "familyBasic",
      quantity: 0,
      seats: 0,
      bookedSeats: 0
    }
  };
  models.Table.findAll()
    .then((tables) => {
      console.log(tables);
      if (tables) {
        for(var i=0; i<tables.length; i++) {
          console.log( response[tables[i].type]);
          response[tables[i].type]["quantity"] = response[tables[i].type]["quantity"] + 1;
          response[tables[i].type]["seats"] = response[tables[i].type]["seats"] + tables[i].size;
          response[tables[i].type]["booekdSeats"] = response[tables[i].type]["bookedSeats"] + tables[i].booked;
        }
        if(headerRes) {
          headerRes = false;
          return res.status(200).json({message: "success", report: response});
        }
      } else {
        if (headerRes) {
          headerRes = false;
          return res.status(401).json({ message: "No tables" });
        }
      }
    })
    .catch((err) => {
      if (headerRes) {
        headerRes = false;
        return res.status(500).json({ message: "error", error: err });
      }
    });
};
