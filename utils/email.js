const nodemailer = require('nodemailer');
const htmlConverter = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `"Mahmoud Sobhy" ${process.env.EMAIL_ADDERESS}`;
    console.log(this.from);
  }

  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.BREVO_USER, // generated ethereal user
          pass: process.env.BREVO_PASSWORD, // generated ethereal password
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firtName: this.firstName,
      subject,
      url: this.url,
    });

    await this.newTransporter().sendMail({
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlConverter.convert(html),
    });
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to The Natours Family! 😍');
  }

  async sendResetPassword() {
    await this.send(
      'resetPassword',
      'Your Password Reset Token (Valid for only 10 minutes)',
    );
  }
};
