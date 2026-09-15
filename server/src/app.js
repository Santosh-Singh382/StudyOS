import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import studySessionRoutes from './routes/studySessionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import milestoneRoutes from './routes/milestoneRoutes.js';
import examRoutes from './routes/examRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/planner', plannerRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;