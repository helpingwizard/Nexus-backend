import express from 'express';
import { z } from 'zod';
import dotenv from 'dotenv';
import { authenticateJwt } from '../middleware/adminAuth';
import { PrismaClient } from '@prisma/client';
import jwt,{ Secret } from 'jsonwebtoken';
dotenv.config();

const secret = process.env.SECRET as Secret;
export const router = express.Router();
const prisma = new PrismaClient();



const credentials = z.object({
    email: z.string().min(10).max(254),
    password: z.string().min(6).max(32),
  });

router.post('/signup', async (req, res) => {
    const parsedInput = credentials.safeParse(req.body);
  
    if (!parsedInput.success) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
  
    const { email, password } = parsedInput.data;
  
    try {
      const admin = await prisma.user.create({
        data: {
          email: email,
          password: password
        },
      });
  
      const token = jwt.sign({id: admin.id, role: 'admin'}, secret, { expiresIn: '1h' });
      console.log('User created successfully');
      res.status(201).json({ message: 'User created successfully',token });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    } finally {
      await prisma.$disconnect();
    }
  });


router.post('/login', async (req, res) => {
    const parsedInput = credentials.safeParse(req.body);
  
    if (!parsedInput.success) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
  
    const { email, password } = parsedInput.data;
  
    try {
      const admin = await prisma.admin.findUnique({
        where: {
          email: email,
          password : password
        }
      });
  
      if (admin) {
        const token = jwt.sign({ id: admin.id , role: 'admin' }, secret, { expiresIn: '1h' });
        res.json({ message: 'Logged in successfully', token });
      } else {
        res.status(403).json({ message: 'Invalid username or password' });
      }
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while processing your request' });
    }
  });
  

router.post('/addpost', authenticateJwt, async (req, res) => {
    const { alumniName, alumniEmail, content, linkedIn, college, startup } = req.body;
    let authorId: string = req.headers["authorId"]?.toString() || "";

    try {
        const post = await prisma.post.create({
            data: {
                alumniEmail: alumniEmail,
                alumniName: alumniName,
                content: content,
                linkedIn: linkedIn,
                college: college,
                startup: startup,
                authorId: parseInt(authorId)
            }
        });
        res.status(201).json(post);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.put('/updatepost/:id', authenticateJwt, async (req, res) => {
  try {
      const { alumniName, alumniEmail, content, linkedIn, college, startup } = req.body;
      let authorId = req.headers["authorId"]?.toString() || "";
      const postId = parseInt(req.params.id, 10);
      const post = await prisma.post.update({
          where: {
              id: postId
          },
          data: {
              alumniName: alumniName,
              alumniEmail: alumniEmail,
              content: content,
              linkedIn: linkedIn,
              college: college,
              startup: startup
          }
      });
      res.status(200).json(post);
  } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'Failed to update post' });
  }
});


router.post('/deletePost/:id', authenticateJwt, async (req, res) => {
    try {

        const postId = parseInt(req.params.id, 10);
        const deletepost = await prisma.user.delete({
            where: {
                id: postId,
            },
        });
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to delete post', error: error.message });
    }
});

router.get('/posts', authenticateJwt, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({});
    res.status(201).send({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send({ error: 'Failed to fetch posts' });
  }
});

router.get('/post/:postId', authenticateJwt, async (req, res) => {
  const postId = req.params.postId;
  const post = await prisma.post.findUnique({
    where: {
      id: parseInt(postId)
    }
  });
  if (post) {
    res.json({ post });
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});


export default router;













