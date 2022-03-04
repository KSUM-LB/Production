'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Traveller extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Traveller.belongsTo(models.Bookings);
      models.Bookings.hasMany(Traveller);
    }
  }
  Traveller.init({
    bookingId: DataTypes.INTEGER,
    fullname: DataTypes.STRING,
    dob: DataTypes.DATE,
    passport: DataTypes.TEXT,
    nationality: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Traveller',
  });
  return Traveller;
};