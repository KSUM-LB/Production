'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addConstraint('RoomBookings', {
      fields: ['bookingId'],
      type: 'foreign key',
      name: 'RoomBooking_booking_association',
      references: {
        table: 'Bookings',
        field: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('RoomBookings', {
      fields: ['bookingId'],
      type: 'foreign key',
      name: 'RoomBooking_booking_association',
      references: {
        table: 'Bookings',
        field: 'id'
      }
    });
  }
};
