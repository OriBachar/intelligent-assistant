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
router.get('/:id/messages', getConversationMessagesHandler);
router.get('/:id', getConversationByIdHandler);
router.put('/:id', updateConversationHandler);
router.delete('/:id', deleteConversationHandler);

export default router;

