import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

// router definition
const baseRouter = express.Router();

// stat routes
baseRouter.get('/status', AppController.getStatus);
baseRouter.get('/stats', AppController.getStats);

// user routes
baseRouter.post('/users', UsersController.postNow);

export default baseRouter;
