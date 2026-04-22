const nodemailer = require('nodemailer');
const { env } = require('../config/env');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and MAIL_FROM.');
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const sender = env.MAIL_FROM || `${env.SMTP_FROM_NAME} <${env.SMTP_USER}>`;
  await getTransporter().sendMail({
    from: sender,
    to,
    subject,
    text,
    html,
  });
};

const sendAuthCodeEmail = async ({ to, code, purpose }) => {
  const isRegistration = purpose === 'REGISTER';
  const action = isRegistration ? 'create your DeReFund account' : 'reset your DeReFund password';
  const subject = isRegistration ? 'Your DeReFund registration code' : 'Your DeReFund password reset code';
  const ttl = env.EMAIL_CODE_TTL_MINUTES;

  await sendEmail({
    to,
    subject,
    text: `Your DeReFund code is ${code}. Use it within ${ttl} minutes to ${action}.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h2 style="margin:0 0 12px">DeReFund verification code</h2>
        <p>Use this code to ${action}:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:18px 0">${code}</div>
        <p>This code expires in ${ttl} minutes.</p>
      </div>
    `,
  });
};

module.exports = {
  sendAuthCodeEmail,
};
