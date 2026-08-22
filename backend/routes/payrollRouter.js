import express from 'express';
import { getMyPayroll } from '../controller/payrollController.js';
import userAuth from '../middleWare/userAuth.js';

const payrollRouter = express.Router();

payrollRouter.get('/my', userAuth, getMyPayroll);

export default payrollRouter;
