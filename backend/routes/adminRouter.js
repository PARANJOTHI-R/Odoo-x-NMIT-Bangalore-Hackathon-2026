import express from 'express';
import { getAdminAttendance } from '../controller/attendanceController.js';
import { getAdminLeaves, approveLeave, rejectLeave } from '../controller/leaveController.js';
import { getAdminPayroll, updateEmployeePayroll } from '../controller/payrollController.js';
import { getAdminEmployees, updateEmployee } from '../controller/employeeController.js';
import userAuth from '../middleWare/userAuth.js';
import requireRole from '../middleWare/roleAuth.js';

const adminRouter = express.Router();

// All admin routes require authentication + admin/hr role
adminRouter.use(userAuth);
adminRouter.use(requireRole(['admin', 'hr']));

adminRouter.get('/attendance',           getAdminAttendance);
adminRouter.get('/leave',                getAdminLeaves);
adminRouter.put('/leave/:id/approve',    approveLeave);
adminRouter.put('/leave/:id/reject',     rejectLeave);
adminRouter.get('/payroll',              getAdminPayroll);
adminRouter.put('/payroll/:userId',      updateEmployeePayroll);
adminRouter.get('/employees',            getAdminEmployees);
adminRouter.put('/employees/:id',        updateEmployee);

export default adminRouter;
