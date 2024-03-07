import express from 'express';
import { getStatus, getStats } from '../controllers/AppController';

const baseRouter = express.Router();
const statRouter = express.Router();

statRouter.get('/status', getStatus);
statRouter.get('/stats', getStats);

baseRouter.use('/', statRouter);

export default baseRouter;
