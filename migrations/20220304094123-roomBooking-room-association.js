'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addConstraint('RoomBookings', {
      fields: ['roomId'],
      type: 'foreign key',
      name: 'RoomBooking_room_association',
      references: {
        table: 'Rooms',
        field: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('RoomBookings', {
      fields: ['roomId'],
      type: 'foreign key',
      name: 'RoomBooking_room_association',
      references: {
        table: 'Rooms',
        field: 'id'
      }
    });
  }
};
