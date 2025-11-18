const nodemailer = require('nodemailer');
const config = require('../config');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: config.EMAIL_SERVICE,
        auth: {
            user: config.EMAIL_USER,
            pass: config.EMAIL_PASS
        }
    });
};

// Send verification email
exports.sendVerificationEmail = async (email, verificationUrl) => {
    const transporter = createTransporter();
    
    const message = {
        from: `"College Club Management" <${config.EMAIL_USER}>`,
        to: email,
        subject: 'Email Verification',
        html: `
            <h2>Email Verification</h2>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
            <p>If you did not create an account, please ignore this email.</p>
        `
    };
    
    await transporter.sendMail(message);
};

// Send membership notification
exports.sendMembershipNotification = async (email, recipientName, memberName, clubName, action) => {
    const transporter = createTransporter();
    
    const actionText = action === 'joined' ? 'joined' : 'left';
    const message = {
        from: `"College Club Management" <${config.EMAIL_USER}>`,
        to: email,
        subject: `Member ${actionText} Your Club`,
        html: `
            <h2>Club Membership Update</h2>
            <p>Hello ${recipientName},</p>
            <p>${memberName} has ${actionText} your club "${clubName}".</p>
            <p>Please log in to your account to view more details.</p>
        `
    };
    
    await transporter.sendMail(message);
};

// Send event notification
exports.sendEventNotification = async (email, recipientName, eventTitle, clubName) => {
    const transporter = createTransporter();
    
    const message = {
        from: `"College Club Management" <${config.EMAIL_USER}>`,
        to: email,
        subject: `New Event: ${eventTitle}`,
        html: `
            <h2>New Event Created</h2>
            <p>Hello ${recipientName},</p>
            <p>A new event "${eventTitle}" has been created for your club "${clubName}".</p>
            <p>Please log in to your account to view more details and RSVP.</p>
        `
    };
    
    await transporter.sendMail(message);
};