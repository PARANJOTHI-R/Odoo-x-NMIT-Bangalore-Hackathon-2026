import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER || process.env.SENDER_EMAIL,
        pass: process.env.SMTP_PASS,
    }
});

console.log("Verifying connection...");
transporter.verify(function(error, success) {
    if (error) {
        console.error("Verification error:", error);
    } else {
        console.log("Server is ready to take our messages:", success);
    }
    process.exit(0);
});
