const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "info@yallacyprus.com",
    pass: "Be@cy2022",
  },
});

exports.sendBookingConfirmationEmail = (recipient, booking) => {
  let message = {
    from: "info@yallacyprus.com",
    to: recipient,
    subject: "Booking Confirmation",
    html: `<h1>Booking Confirmation</h1>
    <b>Booking Id: </b><p>${booking.id}</p>
    <br/><br/>
    <p>Dear Valued Customer,<br/><br/>
    Thanks for choosing Yallacyprus DBA from glory entertainment LLC, we are pleasured to hold your package reservation seats for 24 hours till the payment would be complete. <br/><br/>
    Regards`,
  };

  transporter.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

exports.sendReceiptEmail = (recipient) => {
  let message = {
    from: "info@yallacyprus.com",
    to: recipient,
    subject: "Booking Confirmation",
    html: `<h1>Payement Confirmation</h1>
  <p>This email is to confirm your payment, Thank you for booking with us.</p>`,
  };

  transporter.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};
