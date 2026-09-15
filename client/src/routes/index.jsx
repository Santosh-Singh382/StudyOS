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
import ProtectedRoute from '../components/ProtectedRoute';

const PLACEHOLDER_MODULES = ['goals', 'revision', 'mock-tests', 'analytics', 'ai-assistant', 'settings'];

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