import { Router } from 'express';
import {
  createSkill,
  getSkills,
  updateSkill,
  deleteSkill,
  getCategories,
} from '../controllers/skillController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/categories', getCategories);
router.route('/').get(getSkills).post(createSkill);
router.route('/:id').put(updateSkill).delete(deleteSkill);

export default router;