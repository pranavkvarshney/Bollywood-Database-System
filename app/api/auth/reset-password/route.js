import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import crypto from 'crypto';
import { sendResetEmail } from '@/lib/emailService';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { message: 'Email is required' },
                { status: 400 }
            );
        }


        console.log('Attempting to connect to database...');
        await connectToDatabase();
        console.log('Database connection successful');


        console.log(`Searching for user with email: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('No user found with this email');
            return NextResponse.json(
                { message: 'If a user with this email exists, they will receive a password reset email.' },
                { status: 200 }
            );
        }


        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');


        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes


        console.log('Generated reset token:', resetToken);
        console.log('Hashed reset token:', hashedToken);

        await user.save();


        console.log('Attempting to send reset email...');
        const emailSent = await sendResetEmail(user.email, resetToken);

        if (!emailSent) {
            console.error('Email sending failed');
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return NextResponse.json(
                { message: 'Error sending reset email' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Password reset email sent successfully' },
            { status: 200 }
        );
    } catch (error) {

        console.error('Reset Password Error Details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });

        return NextResponse.json(
            {
                message: 'Internal server error',
                errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}