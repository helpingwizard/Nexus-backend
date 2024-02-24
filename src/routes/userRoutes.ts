import express from 'express';
import { z } from 'zod';
import { authenticateJwt } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

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
    console.log('User created successfully');
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  } finally {
    await prisma.$disconnect();
  }
});


router.post('/login' , async(req,res) => {
    
})

export default router;
