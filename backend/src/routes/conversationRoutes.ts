import { Router } from 'express';
import {
    getAllConversationsHandler,
    getConversationByIdHandler,
    getConversationMessagesHandler,
    updateConversationHandler,
    deleteConversationHandler,
} from '../controllers/conversationController';

const router = Router();

router.get('/', getAllConversationsHandler);
router.get('/:id', getConversationByIdHandler);
router.get('/:id/messages', getConversationMessagesHandler);
router.put('/:id', updateConversationHandler);
router.delete('/:id', deleteConversationHandler);

export default router;

