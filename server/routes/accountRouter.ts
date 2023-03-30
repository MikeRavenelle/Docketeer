/**
 * @module AccountRouter
 * @description Routes all requests to change user information
 */
import { Router, Request, Response } from 'express';
import userController from '../controllers/userController';
import bcryptController from '../controllers/bcryptController';

const router = Router();

// updates password
router.post(
  '/password',
  userController.verifyUser,
  bcryptController.hashNewPassword,
  userController.updatePassword,
  (req: Request, res: Response): Response => {
    if (res.locals.error) return res.status(200).json(res.locals);
    return res.status(201).json('Successfully updated your password.');
  }
);

// updates phone number
router.post(
  '/phone',
  userController.updatePhone,
  (req: Request, res: Response): Response => {
    return res.status(201).json(res.locals.user);
  }
);

// updates email
router.post(
  '/email',
  userController.updateEmail,
  (req: Request, res: Response): Response => {
    return res.status(201).json(res.locals.user);
  }
);

export default router;
