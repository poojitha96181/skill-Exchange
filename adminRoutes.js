import { Router } from 'express';
import {
  getStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  getAllSkills,
  getAllRequests,
  getReports,
  updateReport,
} from '../controllers/adminController.js';
import { deleteSkill } from '../controllers/skillController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect, adminOnly);
router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/skills', getAllSkills);
router.delete('/skills/:id', deleteSkill);
router.get('/requests', getAllRequests);
router.get('/reports', getReports);
router.put('/reports/:id', updateReport);

export default router;