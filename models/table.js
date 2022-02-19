'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Table extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Table.init({
    tableNb: DataTypes.INTEGER,
    type: DataTypes.STRING,
    shape: DataTypes.STRING,
    size: DataTypes.INTEGER,
    booked: DataTypes.INTEGER,
    note: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Table',
  });
  return Table;
};