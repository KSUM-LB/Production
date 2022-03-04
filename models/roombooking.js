'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoomBooking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RoomBooking.belongsTo(models.Room);
      models.Room.hasOne(RoomBooking);

      RoomBooking.belongsTo(models.Bookings);
      models.Bookings.hasOne(RoomBooking);
    }
  }
  RoomBooking.init({
    roomId: DataTypes.INTEGER,
    bookingId: DataTypes.INTEGER,
    nbOfPeople: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'RoomBooking',
  });
  return RoomBooking;
};