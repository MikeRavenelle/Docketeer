/**
 * @module | signupRouter.ts
 * @description | Routes all requests to signup endpoint
 **/

import { Router, Request, Response } from 'express';
import userController from '../controllers/userController';
// import apiController from '../controllers/apiController'; // controller for sending email notification
// import signupController from '../controllers/signupController';

const router = Router();

// Only trigger this endpoint when sysAdmin logs in; gets all users
router.get(
  '/',
  userController.getAllUsers,
  (req: Request, res: Response): Response => {
    return res.status(200).json(res.locals.users);
  }
);

// Hashes password and inserts user to db
router.post(
  '/',
  userController.createUser,
  (req: Request, res: Response): Response => {
    if (res.locals.error) return res.status(201).json(res.locals);
    return res.status(201).json('successfully added new user to database');
  }
);

export default router;
