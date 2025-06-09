import express from 'express';
import { getAllPosts, getPostById, createPost, updatePost, deletePost, likePost } from '../controllers/postController';
import { validatePost } from '../middlewares/postMiddleware';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', validatePost, createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);

export default router;