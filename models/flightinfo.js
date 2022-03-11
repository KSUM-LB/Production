'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FlightInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      FlightInfo.belongsTo(models.Bookings);
      models.Bookings.hasMany(FlightInfo);
    }
  }
  FlightInfo.init({
    bookingId: DataTypes.INTEGER,
    arrivalAirline: DataTypes.STRING,
    arrivalFNb: DataTypes.STRING,
    arrivalDate: DataTypes.DATE,
    departureAirline: DataTypes.STRING,
    departureFNb: DataTypes.STRING,
    departureDate: DataTypes.DATE,
    travellers: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'FlightInfo',
  });
  return FlightInfo;
};