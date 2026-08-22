import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function testEmail() {
    try {
        console.log('Sending test email to:', process.env.SENDER_EMAIL);
        const info = await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: process.env.SENDER_EMAIL,
            subject: "Test Email from Dayflow",
            text: "This is a test email.",
        });
        console.log("Message sent: %s", info.messageId);
    } catch (err) {
        console.error("Error sending email:", err);
    }
}

testEmail();
