'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Room.init({
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    maxSize: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    booked: DataTypes.INTEGER,
    singlePrice: DataTypes.DOUBLE,
    couplePrice: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'Room',
  });
  return Room;
};