'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FlightInfos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bookingId: {
        type: Sequelize.INTEGER
      },
      arrivalAirline: {
        type: Sequelize.STRING
      },
      arrivalFNb: {
        type: Sequelize.STRING
      },
      arrivalDate: {
        type: Sequelize.DATE
      },
      departureAirline: {
        type: Sequelize.STRING
      },
      departureFNb: {
        type: Sequelize.STRING
      },
      departureDate: {
        type: Sequelize.DATE
      },
      travellers: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FlightInfos');
  }
};