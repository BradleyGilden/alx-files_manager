import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

// router definition
const baseRouter = express.Router();

baseRouter
// stat routes
  .get('/status', AppController.getStatus)
  .get('/stats', AppController.getStats)
// user routes
  .post('/users', UsersController.postNow)
  .get('/users/me', UsersController.getMe)
// auth routes
  .get('/connect', AuthController.getConnect)
  .get('/disconnect', AuthController.getDisconnect)
// file routes
  .post('/files', FilesController.postUpload);

export default baseRouter;
