import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import router from './routes';

export default function App() {
  return (
    <AuthProvider>
      <TimerProvider>
        <RouterProvider router={router} />
      </TimerProvider>
    </AuthProvider>
  );
}