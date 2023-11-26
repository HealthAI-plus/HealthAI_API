const nodemailer = require("nodemailer");
const {ORGANISATION_EMAIL_PASSWORD, ORGANISATION_EMAIL_ADDRESS, ORGANISATION_MAIL_HOST} = require('./')

const transporter = nodemailer.createTransport({
  host: ORGANISATION_MAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: ORGANISATION_EMAIL_ADDRESS,
    pass: ORGANISATION_EMAIL_PASSWORD
  },
});

module.exports = {
  transporter
}