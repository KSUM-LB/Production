'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addConstraint('TableBookings', {
      fields: ['bookingId'],
      type: 'foreign key',
      name: 'TableBooking_booking_association',
      references: {
        table: 'Bookings',
        field: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('TableBookings', {
      fields: ['bookingId'],
      type: 'foreign key',
      name: 'TableBooking_booking_association',
      references: {
        table: 'Bookings',
        field: 'id'
      }
    });
  }
};
