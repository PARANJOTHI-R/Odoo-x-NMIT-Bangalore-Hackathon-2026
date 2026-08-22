import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

console.log("SMTP_USER exists:", !!process.env.SMTP_USER);
console.log("SMTP_PASS exists:", !!process.env.SMTP_PASS);
console.log("SENDER_EMAIL exists:", !!process.env.SENDER_EMAIL);
console.log("SMTP host: smtp-relay.brevo.com");
console.log("SMTP port: 587");
