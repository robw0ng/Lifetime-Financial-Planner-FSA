import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from "./LoginPage.module.css"

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

  // const handleSuccess = (credentialResponse) => {
  //   const token = credentialResponse.credential;
  //   const userInfo = JSON.parse(atob(token.split('.')[1]));
    
  //   console.log('User Info:', userInfo);
  //   console.log('Token: ', token)
  //   // Save user info in context
  //   login(userInfo);

  //   // Redirect to home page after login
  //   navigate('/');
  // };
  const handleSuccess = async (credentialResponse) => {
		try {
			const token = credentialResponse.credential;
			// const response = await fetch("http://localhost:8000/auth", {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token }),
				credentials: "include",
			});

			const data = await response.json();
			if (response.status == 201) {
				const userInfo = data.user;
				console.log("User Authenticated:", userInfo);
				console.log("User Token: ", token);
				// Save user info in context
				login(userInfo);
				// Redirect to home page after login
				navigate("/");
			} else {
				console.log("Authentication failure:", data);
			}
		} catch (err) {
			console.log("Error during Google login:", err.message);
		}
	};

  const handleError = () => {
    console.error('Login Failed');
  };

  return (
    <div>
      <div>
        <h1>Sign In</h1>
        <div className={styles["login-button-container"]}>
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
