import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../../.env")
});

const { Client } = pg;

const initDb = async () => {
    // Connect to the default database (e.g., postgres) to create the new dayflow DB
    // We assume POSTGRES_URI connects to the default db
    const client = new Client({
        connectionString: process.env.POSTGRES_URI,
    });

    try {
        await client.connect();
        console.log("Connected to default database");

        // Try to create the database (will error if exists, we catch it)
        try {
            await client.query('CREATE DATABASE dayflow');
            console.log("Database dayflow created");
        } catch (dbErr) {
            if (dbErr.code === '42P04') { // duplicate_database
                console.log("Database dayflow already exists");
            } else {
                throw dbErr;
            }
        }
    } catch (err) {
        console.error("Error connecting/creating database:", err.message);
    } finally {
        await client.end();
    }

    // Now connect to the new dayflow database to create tables
    // We construct the new URI by replacing the database name
    const uriObj = new URL(process.env.POSTGRES_URI);
    uriObj.pathname = '/dayflow';
    const dayflowUri = uriObj.toString();

    const dayflowClient = new Client({
        connectionString: dayflowUri,
    });

    try {
        await dayflowClient.connect();
        console.log("Connected to dayflow database");

        const createUsersTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) CHECK (role IN ('hr', 'employee')) DEFAULT 'hr',
                verify_otp VARCHAR(255),
                verify_otp_expire TIMESTAMP,
                is_acc_verified BOOLEAN DEFAULT FALSE,
                reset_otp VARCHAR(255),
                reset_otp_expire TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;
        
        await dayflowClient.query(createUsersTableQuery);
        console.log("users table created successfully");

    } catch (err) {
        console.error("Error creating users table:", err.message);
    } finally {
        await dayflowClient.end();
    }
};

initDb();
