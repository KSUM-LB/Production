'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bookings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bookings.belongsTo(models.User);
      models.User.hasMany(Bookings);

      Bookings.belongsTo(models.Coupon);
      models.Coupon.hasMany(Bookings);
    }
  }
  Bookings.init({
    manuel: DataTypes.BOOLEAN,
    status: DataTypes.BOOLEAN,
    payed: DataTypes.BOOLEAN,
    CC: DataTypes.BOOLEAN,
    userId: DataTypes.INTEGER,
    QrCode: DataTypes.TEXT,
    nbOfTravellers: DataTypes.INTEGER,
    nbOfRooms: DataTypes.INTEGER,
    nbOfTables: DataTypes.INTEGER,
    checkIn: DataTypes.DATE,
    checkOut: DataTypes.DATE,
    price: DataTypes.INTEGER,
    couponId: DataTypes.INTEGER,
    total: DataTypes.INTEGER,
    manualTotal: DataTypes.INTEGER,
    adminNote: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Bookings',
  });
  return Bookings;
};