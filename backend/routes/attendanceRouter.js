import express from 'express';
import { checkIn, checkOut, getMyAttendance } from '../controller/attendanceController.js';
import userAuth from '../middleWare/userAuth.js';

const attendanceRouter = express.Router();

attendanceRouter.post('/checkin',  userAuth, checkIn);
attendanceRouter.post('/checkout', userAuth, checkOut);
attendanceRouter.get('/my',        userAuth, getMyAttendance);

export default attendanceRouter;
