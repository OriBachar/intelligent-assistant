import { Router } from 'express';
import chatRoutes from './chatRoutes';
import conversationRoutes from './conversationRoutes';

const router = Router();

router.use('/chat', chatRoutes);
router.use('/conversations', conversationRoutes);

export default router;
