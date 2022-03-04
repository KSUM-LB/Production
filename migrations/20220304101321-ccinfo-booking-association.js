'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addConstraint('CCinfos', {
      fields: ['bookingId'],
      type: 'foreign key',
      name: 'CCinfo_booking_association',
      references: {
        table: 'Bookings',
        field: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('CCinfos', {
      fields: ['bookingId'],
      type: 'foreign key',
      name: 'CCinfo_booking_association',
      references: {
        table: 'Bookings',
        field: 'id'
      }
    });
  }
};
