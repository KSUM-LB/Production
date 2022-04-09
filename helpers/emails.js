const nodemailer = require("nodemailer");

exports.sendBookingConfirmationEmail = (recipient) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "kareem.deaibes741211@gmail.com",
      pass: "kareem.deaibes741211PASSWORD",
    },
  });

  let message = {
    from: "kareem.deaibes741211@gmail.com",
    to: recipient,
    subject: "Booking Confirmation",
    html: "<h1>Hello test email</h1>",
  };

  transporter.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};
