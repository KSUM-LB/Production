'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addConstraint('Travellers', {
      fields: ['bookingId'],
      type: 'foreign key',
      name: 'traveller_booking_association',
      references: {
        table: 'Bookings',
        field: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('Travellers', {
      fields: ['bookingId'],
      type: 'foreign key',
      name: 'traveller_booking_association',
      references: {
        table: 'Bookings',
        field: 'id'
      }
    });
  }
};
