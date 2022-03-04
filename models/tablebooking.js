'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TableBooking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TableBooking.belongsTo(models.Table);
      models.Table.hasOne(TableBooking);

      TableBooking.belongsTo(models.Bookings);
      models.Bookings.hasOne(TableBooking);
    }
  }
  TableBooking.init({
    tableId: DataTypes.INTEGER,
    bookingId: DataTypes.INTEGER,
    nbOfPeople: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'TableBooking',
  });
  return TableBooking;
};