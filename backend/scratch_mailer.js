import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    secure: false,
    port: 587,
    auth:{
        user: process.env.SMTP_USER || 'missing',
        pass: process.env.SMTP_PASS || 'missing'
    }
});

console.log("Attempting to connect to Brevo SMTP...");
transporter.verify(function(error, success) {
    if (error) {
        console.error("Connection error:", error);
    } else {
        console.log("Server is ready to take our messages");
    }
    process.exit(0);
});
