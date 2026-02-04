import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * A component that protects routes from being accessed by unauthenticated users.
 * If the user is not authenticated, they are redirected to the login page.
 * 
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render if authenticated.
 * @returns {React.ReactNode} The protected route or a redirect to the login page.
 */ 
export default function ProtectedRoute({ children }) {
  const { userId } = useAuth();
  console.log('🛡️ ProtectedRoute sees userId:', userId);
  if (!userId) {
    return <Navigate to="/login" />;
  }

  return children;
}