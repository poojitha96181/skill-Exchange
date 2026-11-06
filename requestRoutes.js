import { Router } from 'express';
import {
  createRequest,
  getSentRequests,
  getReceivedRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
  cancelRequest,
} from '../controllers/requestController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.post('/', createRequest);
router.get('/sent', getSentRequests);
router.get('/received', getReceivedRequests);
router.put('/:id/accept', acceptRequest);
router.put('/:id/reject', rejectRequest);
router.put('/:id/complete', completeRequest);
router.put('/:id/cancel', cancelRequest);

export default router;