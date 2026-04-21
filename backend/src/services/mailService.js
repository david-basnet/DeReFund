const nodemailer = require('nodemailer');
const { env } = require('../config/env');

const hasSmtpConfig = () => Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
const hasSendGridConfig = () => Boolean(env.SENDGRID_API_KEY && (env.SENDGRID_FROM_EMAIL || env.MAIL_FROM));

const createTransport = () => nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

const sendAuthCodeEmail = async ({ to, code, purpose }) => {
  const isReset = purpose === 'PASSWORD_RESET';
  const subject = isReset ? 'DeReFund password reset code' : 'Verify your DeReFund account';
  const title = isReset ? 'Reset your password' : 'Verify your email';
  const action = isReset ? 'reset your password' : 'create your account';
  const text = `${title}\n\nYour DeReFund code is ${code}. Use this code to ${action}. It expires soon.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#102033">
      <h2>${title}</h2>
      <p>Your DeReFund code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
      <p>Use this code to ${action}. It expires soon.</p>
    </div>
  `;

  if (hasSendGridConfig()) {
    const fromEmail = env.SENDGRID_FROM_EMAIL || env.MAIL_FROM;
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: {
          email: fromEmail,
          name: env.SENDGRID_FROM_NAME || 'DeReFund',
        },
        subject,
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SendGrid mail failed: ${response.status} ${errorText}`);
    }

    return { sent: true, provider: 'sendgrid' };
  }

  if (!hasSmtpConfig()) {
    console.log(`[MAIL DEV] ${subject} for ${to}: ${code}`);
    return { sent: false, devCode: code };
  }

  const transporter = createTransport();
  await transporter.sendMail({
    from: env.MAIL_FROM || env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return { sent: true, provider: 'smtp' };
};

module.exports = {
  sendAuthCodeEmail,
};
