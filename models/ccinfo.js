'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CCinfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CCinfo.belongsTo(models.Bookings);
      models.Bookings.hasOne(CCinfo);
    }
  }
  CCinfo.init({
    bookingId: DataTypes.INTEGER,
    cardNumber: DataTypes.STRING,
    expirationDate: DataTypes.STRING,
    cardCode: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CCinfo',
  });
  return CCinfo;
};