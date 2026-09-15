import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Subjects from '../pages/Subjects';
import SubjectDetail from '../pages/SubjectDetail';
import Topics from '../pages/Topics';
import Tasks from '../pages/Tasks';
import Timer from '../pages/Timer';
import NotFound from '../pages/NotFound';
import PlaceholderPage from '../pages/PlaceholderPage';
import Planner from '../pages/Planner';
import Goals from '../pages/Goals';
import GoalDetail from '../pages/GoalDetail';
import Exams from '../pages/Exams';
import ExamDetail from '../pages/ExamDetail';
import ProtectedRoute from '../components/ProtectedRoute';

const PLACEHOLDER_MODULES = ['revision', 'mock-tests', 'analytics', 'ai-assistant', 'settings'];

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'subjects',
        element: (
          <ProtectedRoute>
            <Subjects />
          </ProtectedRoute>
        ),
      },
      {
        path: 'subjects/:id',
        element: (
          <ProtectedRoute>
            <SubjectDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'topics',
        element: (
          <ProtectedRoute>
            <Topics />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks',
        element: (
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        ),
      },
      {
        path: 'timer',
        element: (
          <ProtectedRoute>
            <Timer />
          </ProtectedRoute>
        ),
      },
      {
        path: 'planner',
        element: (
          <ProtectedRoute>
            <Planner />
          </ProtectedRoute>
        ),
      },
      {
        path: 'goals',
        element: (
          <ProtectedRoute>
            <Goals />
          </ProtectedRoute>
        ),
      },
      {
        path: 'goals/:id',
        element: (
          <ProtectedRoute>
            <GoalDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'exams',
        element: (
          <ProtectedRoute>
            <Exams />
          </ProtectedRoute>
        ),
      },
      {
        path: 'exams/:id',
        element: (
          <ProtectedRoute>
            <ExamDetail />
          </ProtectedRoute>
        ),
      },
      ...PLACEHOLDER_MODULES.map((module) => ({
        path: module,
        element: (
          <ProtectedRoute>
            <PlaceholderPage module={module} />
          </ProtectedRoute>
        ),
      })),
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;