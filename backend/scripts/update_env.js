import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");

let envContent = fs.readFileSync(envPath, 'utf8');

// Parse the env to get POSTGRES_URI
const parsed = dotenv.parse(envContent);
if (parsed.POSTGRES_URI) {
    const uriObj = new URL(parsed.POSTGRES_URI);
    if (!uriObj.pathname.includes('/dayflow')) {
        uriObj.pathname = '/dayflow';
        const newUri = uriObj.toString();
        // Replace in content
        envContent = envContent.replace(parsed.POSTGRES_URI, newUri);
        fs.writeFileSync(envPath, envContent);
        console.log("Updated POSTGRES_URI to use dayflow database");
    } else {
        console.log("POSTGRES_URI already uses dayflow database");
    }
}
