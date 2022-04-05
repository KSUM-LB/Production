'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addConstraint('FlightInfos', {
      fields: ['bookingId'],
      type: 'foreign key',
      name: 'FlightInfo_booking_association',
      references: {
        table: 'Bookings',
        field: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('FlightInfos', {
      fields: ['bookingId'],
      type: 'foreign key',
      name: 'FlightInfo_booking_association',
      references: {
        table: 'Bookings',
        field: 'id'
      }
    });
  }
};
