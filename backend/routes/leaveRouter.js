import express from 'express';
import { applyLeave, getMyLeaves } from '../controller/leaveController.js';
import userAuth from '../middleWare/userAuth.js';

const leaveRouter = express.Router();

leaveRouter.post('/apply', userAuth, applyLeave);
leaveRouter.get('/my',     userAuth, getMyLeaves);

export default leaveRouter;
