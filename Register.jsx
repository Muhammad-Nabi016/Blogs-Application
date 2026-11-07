import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_URL = "http://localhost:5000/api/auth";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const navigate = useNavigate();
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
            `${API_URL}/register`,
            formData
        );

        setMessage(response.data.message);

        setFormData({
            name: "",
            email: "",
            password: ""
        });

        // Redirect to Login page after successful registration
        navigate("/login");

    } catch (err) {
        setError(
            err.response?.data?.message ||
            "Registration failed. Please try again."
        );
    }
};


    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Create Account</h2>
                <p>Join BlogSpace today!</p>

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

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
                    minLength="8"
                />

                <button type="submit">Register</button>

                <p>
                    Already have an account? <a href="/login">Login</a>
                </p>
            </form>
        </div>
    );
}

export default Register;