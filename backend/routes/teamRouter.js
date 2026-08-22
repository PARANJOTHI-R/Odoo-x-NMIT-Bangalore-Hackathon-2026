import express from 'express';
import {
    getTeams,
    addTeam,
    getHrTeams,
    assignTeam,
    unassignTeam,
    getHrTeamAssignments
} from '../controller/teamController.js';
import userAuth from '../middleWare/userAuth.js';
import requireRole from '../middleWare/roleAuth.js';

const teamRouter = express.Router();

teamRouter.use(userAuth);
teamRouter.use(requireRole(['hr', 'admin']));

// General team endpoints
teamRouter.get('/', getTeams);
teamRouter.post('/', addTeam);

// Endpoints for the currently logged-in HR
teamRouter.get('/my', getHrTeams);

// Management endpoints (admin or higher-level HR assigning other HRs)
teamRouter.get('/assignments', getHrTeamAssignments);
teamRouter.post('/hr/:hrId/assign', assignTeam);
teamRouter.delete('/hr/:hrId/assign/:teamId', unassignTeam);

export default teamRouter;
