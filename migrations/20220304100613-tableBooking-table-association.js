'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addConstraint('TableBookings', {
      fields: ['tableId'],
      type: 'foreign key',
      name: 'TableBooking_table_association',
      references: {
        table: 'Tables',
        field: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('TableBookings', {
      fields: ['tableId'],
      type: 'foreign key',
      name: 'TableBooking_table_association',
      references: {
        table: 'Tables',
        field: 'id'
      }
    });
  }
};
