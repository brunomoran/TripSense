import express from 'express';
import { getAllPosts, getPostById, createPost, updatePost, deletePost, likePost } from '../controllers/postController';
import { validatePost, checkPostExists } from '../middlewares/postMiddleware';
import { checkItineraryExists } from '../middlewares/itineraryMiddleware';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/:id', checkPostExists, getPostById);
router.post('/', validatePost, createPost);
router.put('/:id', updatePost);
router.delete('/:id', checkPostExists, deletePost);
router.post('/:id/like', checkPostExists, likePost);
