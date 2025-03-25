import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const continueAsGuest = () => {
    login({
      name: 'Guest',
      picture: null, // Default guest avatar
      email: null, // No email for guest
    });

    navigate('/'); // Redirect to home page after login
  };

  const handleSuccess = (credentialResponse) => {
    const token = credentialResponse.credential;
    const userInfo = JSON.parse(atob(token.split('.')[1]));
    
    console.log('User Info:', userInfo);
    console.log('Token: ', token)
    // Save user info in context
    login(userInfo);

    // Redirect to home page after login
    navigate('/');
  };

  const handleError = () => {
    console.error('Login Failed');
  };

  return (
    <div>
      <div>
        <h1>Sign In</h1>
        <div className='login-btn-container'>
          <GoogleOAuthProvider  clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
          </GoogleOAuthProvider>
        </div>

        <button onClick={continueAsGuest}>
          Continue as Guest
        </button>

      </div>
    </div>
  );
};

export default LoginPage;
