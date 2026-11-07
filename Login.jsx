import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/auth";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await axios.post(
                `${API_URL}/login`,
                formData
            );

            // Save JWT token
            localStorage.setItem("token", response.data.token);

            // Save user information
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            setMessage("Login successful!");

            setTimeout(() => {
                navigate("/");
                window.location.reload();
            }, 1000);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login failed. Please try again."
            );
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Welcome Back</h2>
                <p>Login to your BlogSpace account</p>

                {message && (
                    <div className="success-message">{message}</div>
                )}

                {error && (
                    <div className="error-message">{error}</div>
                )}

                <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit">Login</button>

                <p>
                    Don't have an account?{" "}
                    <a href="/register">Register</a>
                </p>
            </form>
        </div>
    );
}

export default Login;