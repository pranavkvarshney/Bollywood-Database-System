import nodemailer from 'nodemailer';

const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email credentials are not properly configured');
    }
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },

        logger: true,
        debug: true
    });
};

export async function sendResetEmail(email, resetToken) {
    try {
        console.log('Starting email send process...');
        console.log('Email credentials:', {
            user: process.env.EMAIL_USER ? 'Present' : 'Missing',
            appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set'
        });

        const transporter = createTransporter();
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${resetToken}`;


        if (!resetUrl.startsWith('http')) {
            throw new Error('Invalid reset URL configuration');
        }

        const mailOptions = {
            from: `"BollY BuzZ" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request - BollY BuzZ',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #EAB308; text-align: center;">BollY BuzZ Password Reset</h2>
                    <div style="padding: 20px; background-color: #f8f8f8; border-radius: 10px;">
                        <p>Hello,</p>
                        <p>You have requested to reset your password. Please click the button below to set a new password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}"
                               style="background-color: #EAB308;
                                      color: white;
                                      padding: 12px 24px;
                                      text-decoration: none;
                                      border-radius: 5px;
                                      display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                        <p>This link will expire in 30 minutes.</p>
                        <p>If you didn't request this password reset, please ignore this email.</p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #666; font-size: 12px;">
                            This is an automated email from BollY BuzZ. Please do not reply.
                        </p>
                    </div>
                </div>
            `
        };

        console.log('Attempting to send email to:', email);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Comprehensive Email Sending Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw error;
    }
}