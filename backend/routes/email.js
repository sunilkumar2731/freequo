import express from 'express';
import { sendApplicationEmail } from '../controllers/emailController.js';

const router = express.Router();

router.post('/send-application-email', sendApplicationEmail);
router.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Email server is running' });
});

export default router;
