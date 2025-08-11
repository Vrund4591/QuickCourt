const nodemailer = require('nodemailer');

// Validate email configuration
const validateEmailConfig = () => {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing email configuration: ${missing.join(', ')}`);
    return false;
  }
  return true;
};

// Create transporter with better error handling
const createTransporter = () => {
  if (!validateEmailConfig()) {
    console.log('Email configuration incomplete - using development mode');
    return null;
  }

  try {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
};

const transporter = createTransporter();

const sendOTPEmail = async (email, otp, fullName) => {
  try {
    // Development mode - just log the OTP
    if (!transporter || process.env.NODE_ENV === 'development') {
      console.log('\n=== DEVELOPMENT MODE - EMAIL NOT SENT ===');
      console.log(`To: ${email}`);
      console.log(`Name: ${fullName}`);
      console.log(`OTP: ${otp}`);
      console.log(`Expires in: ${process.env.OTP_EXPIRE_MINUTES || 10} minutes`);
      console.log('==========================================\n');
      return { success: true, mode: 'development' };
    }

    // Verify transporter connection
    await transporter.verify();

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
          <p>This OTP will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.</p>
          <p>If you didn't create an account with QuickCourt, please ignore this email.</p>
          <br>
          <p>Best regards,<br>QuickCourt Team</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email, 'MessageID:', result.messageId);
    return { success: true, messageId: result.messageId, mode: 'production' };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    
    // In development, still log OTP even if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== EMAIL FAILED - DEVELOPMENT FALLBACK ===');
      console.log(`To: ${email}`);
      console.log(`Name: ${fullName}`);
      console.log(`OTP: ${otp}`);
      console.log('==========================================\n');
      return { success: true, mode: 'development-fallback' };
    }
    
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

module.exports = { sendOTPEmail, validateEmailConfig };
