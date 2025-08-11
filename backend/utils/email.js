const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendOTPEmail = async (email, otp, fullName) => {
  try {
    const mailOptions = {
      from: `"QuickCourt" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'QuickCourt - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to QuickCourt!</h2>
          <p>Hi ${fullName},</p>
          <p>Thank you for registering with QuickCourt. Please use the following OTP to verify your email address:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in ${process.env.OTP_EXPIRE_MINUTES} minutes.</p>
          <p>If you didn't create an account with QuickCourt, please ignore this email.</p>
          <br>
          <p>Best regards,<br>QuickCourt Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = { sendOTPEmail };
