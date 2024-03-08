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
  .post('/files', FilesController.postUpload)
  .get('/files/:id', FilesController.getShow)
  .get('/files', FilesController.getIndex)
  .put('/files/:id/publish', FilesController.putPublish)
  .put('/files/:id/unpublish', FilesController.putUnpublish);

export default baseRouter;
