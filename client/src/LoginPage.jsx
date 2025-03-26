import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
	const { login } = useAuth();
	const navigate = useNavigate();

	const continueAsGuest = () => {
		login({
			name: "Guest",
			picture: null, // Default guest avatar
			email: null, // No email for guest
		});

		navigate("/"); // Redirect to home page after login
	};

	const handleSuccess = async (credentialResponse) => {
		try {
			const token = credentialResponse.credential;
			const response = await fetch("http://localhost:8000/auth", {
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
		console.error("Login Failed");
	};

	return (
		<div>
			<div>
				<h1>Sign In</h1>
				<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
					<GoogleLogin onSuccess={handleSuccess} onError={handleError} />
				</GoogleOAuthProvider>

				<button onClick={continueAsGuest}>Continue as Guest</button>
			</div>
		</div>
	);
};

export default LoginPage;
