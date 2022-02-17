'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Role);
      models.Role.hasMany(User);
    }
  }
  User.init({
    roleId: DataTypes.INTEGER,
    fullName: DataTypes.STRING,
    email: DataTypes.TEXT,
    password: DataTypes.TEXT,
    phoneNb: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};