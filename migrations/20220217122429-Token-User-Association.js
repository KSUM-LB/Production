'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addConstraint('Tokens', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'token_role_association',
      references: {
        table: 'Users',
        field: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('Tokens', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'token_role_association',
      references: {
        table: 'Users',
        field: 'id'
      }
    });
  }
};
