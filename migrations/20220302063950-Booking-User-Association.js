'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addConstraint('Bookings', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'booking_user_association',
      references: {
        table: 'Users',
        field: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('Bookings', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'booking_user_association',
      references: {
        table: 'Users',
        field: 'id'
      }
    });
  }
};
