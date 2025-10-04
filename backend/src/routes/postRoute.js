import express from 'express';
import { createPost, deletePost,updateTitle,updateContent,getPosts,postsUser,myPosts } from '../controllers/postController.js';
import upload from '../controllers/postController.js'; 
import { requireAuth } from '../middlewares.js';

const postRouter = express.Router();
postRouter.get('/posts', getPosts);

postRouter.post('/post',requireAuth, upload.single('image'), createPost);
postRouter.delete('/deletePost',requireAuth, deletePost); 
postRouter.put('/update/title',requireAuth, updateTitle);
postRouter.put('/update/content',requireAuth, updateContent);
//postRouter.post("/upload", upload.single("image"), createUser);
//postRouter.put('/update/image', updAateImage);
postRouter.get('/my-posts',myPosts);
postRouter.get('/:username', postsUser);

export default postRouter;
