const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendApprovalEmail = async (toEmail, slotNumber, plateNumber, vehicleType) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Parking Slot Request Approved',
      html: `
        <h2>Your Parking Slot Request Has Been Approved</h2>
        <p>Your vehicle (${plateNumber}, ${vehicleType}) has been assigned parking slot ${slotNumber}.</p>
        <p>Thank you for using our parking management system.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending approval email:', err);
    throw err;
  }
};

module.exports = { sendApprovalEmail };