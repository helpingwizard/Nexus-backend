import express from 'express';
import { z } from 'zod';
import dotenv from 'dotenv';
import { authenticateJwt } from '../middleware/userAuth';
import { PrismaClient } from '@prisma/client';
import jwt,{ Secret } from 'jsonwebtoken';
dotenv.config();

const secret = process.env.SECRET as Secret;


export const router = express.Router();
const prisma = new PrismaClient();

const credentials = z.object({
  email: z.string().min(10).max(254),
  name: z.string().min(4).max(50),
  password: z.string().min(6).max(32),
});

router.post('/signup', async (req, res) => {
  const parsedInput = credentials.safeParse(req.body);

  if (!parsedInput.success) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  const { email, name, password } = parsedInput.data;

  try {
    await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: password
      },
    });

    const token = jwt.sign({id: email, role: 'admin'}, secret, { expiresIn: '1h' });
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

  const { email, name, password } = parsedInput.data;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (user) {
      const token = jwt.sign({ id: email, role: 'admin' }, secret, { expiresIn: '1h' });
      res.json({ message: 'Logged in successfully', token });
    } else {
      res.status(403).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing your request' });
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


export default router;
