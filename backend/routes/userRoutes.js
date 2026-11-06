import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  updateProfile,
  updateProfilePicture,
} from '../controllers/userController.js';
import { getDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/', getStudents);
router.put('/profile', updateProfile);
router.put('/profile/picture', upload.single('picture'), updateProfilePicture);
router.get('/:id', getStudentById);

export default router;