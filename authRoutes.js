import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { register, login, me, validateRegister, validateLogin } from '../controllers/authController.js';

const router = Router();

// Separate endpoints for donor/recipient register map to same controller with userType enforced
router.post('/register-donor', validateRegister, (req, res, next) => {
	req.body.userType = 'donor';
	return register(req, res, next);
});

router.post('/register-recipient', validateRegister, (req, res, next) => {
	req.body.userType = 'recipient';
	return register(req, res, next);
});

router.post('/login', validateLogin, login);
router.get('/me', protect, me);

export default router;


