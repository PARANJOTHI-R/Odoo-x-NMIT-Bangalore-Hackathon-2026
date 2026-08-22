import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: path.resolve(process.cwd(), "../.env")
});

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    secure: false,
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export default transporter;