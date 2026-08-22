import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter       from './routes/authRouter.js';
import attendanceRouter from './routes/attendanceRouter.js';
import leaveRouter      from './routes/leaveRouter.js';
import payrollRouter    from './routes/payrollRouter.js';
import employeeRouter   from './routes/employeeRouter.js';
import connectDB from './config/postgresdb.js';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',       authRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leave',      leaveRouter);
app.use('/api/payroll',    payrollRouter);
app.use('/api/employee',   employeeRouter);

// Admin routes are handled inside each router under /api/admin/*
// Convenience: mount admin sub-paths
import adminRouter from './routes/adminRouter.js';
app.use('/api/admin', adminRouter);

import teamRouter from './routes/teamRouter.js';
app.use('/api/teams', teamRouter);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    server.on('error', (err) => {
        console.error('Server error:', err);
    });
});

