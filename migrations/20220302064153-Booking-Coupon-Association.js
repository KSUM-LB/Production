'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addConstraint('Bookings', {
      fields: ['couponId'],
      type: 'foreign key',
      name: 'booking_coupon_association',
      references: {
        table: 'Coupons',
        field: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('Bookings', {
      fields: ['couponId'],
      type: 'foreign key',
      name: 'booking_coupon_association',
      references: {
        table: 'Coupons',
        field: 'id'
      }
    });
  }
};
