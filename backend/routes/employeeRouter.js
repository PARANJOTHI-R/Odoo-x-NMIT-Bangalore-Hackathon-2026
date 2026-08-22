import express from 'express';
import { getProfile, updateProfile } from '../controller/employeeController.js';
import userAuth from '../middleWare/userAuth.js';

const employeeRouter = express.Router();

employeeRouter.get('/profile',  userAuth, getProfile);
employeeRouter.put('/profile',  userAuth, updateProfile);

export default employeeRouter;
