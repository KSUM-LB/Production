'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addConstraint('Users', {
      fields: ['roleId'],
      type: 'foreign key',
      name: 'user_role_association',
      references: {
        table: 'Roles',
        field: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('Users', {
      fields: ['roleId'],
      type: 'foreign key',
      name: 'user_role_association',
      references: {
        table: 'Roles',
        field: 'id'
      }
    });
  }
};
