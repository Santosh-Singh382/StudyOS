import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Subjects from '../pages/Subjects';
import SubjectDetail from '../pages/SubjectDetail';
import Topics from '../pages/Topics';
import Tasks from '../pages/Tasks';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
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
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;