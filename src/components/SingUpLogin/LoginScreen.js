import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import ApiService from "../../services/ApiService";
import logo from "../images/logo2.png";
import "./LoginScreen.css";

export default function LoginScreen({ onLogin }) {
    const [isApplicant, setIsApplicant] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState("");
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please enter email and password.");
            return;
        }

        try {
            setError(""); // Clear previous errors
            console.log("🔄 STEP 1: Starting login process...", { email, password });

            // Use unified login
            const response = await ApiService.loginUser(email, password);
            console.log("🔄 STEP 2: Login response received:", response);

            // Check what was stored in localStorage
            console.log("🔑 Stored token:", localStorage.getItem("token"));
            console.log("👤 Stored user:", localStorage.getItem("user"));
            console.log("🎯 Stored role:", localStorage.getItem("role"));

            if (response && response.success) {
                console.log("🔄 STEP 3: Login successful, processing user data...");

                // Get user data from response
                const userFromResponse = response.user;
                console.log("📋 User data from response:", userFromResponse);

                // Show welcome alert
                const userName = userFromResponse.firstName || "User";
                alert(`Welcome ${userName}!`);
                console.log("🔄 STEP 4: Welcome alert shown");

                // Pass the complete response to parent App.js
                console.log("🔄 STEP 5: Calling onLogin callback");
                onLogin(response);

                // ✅ ADD THIS: Navigate to the correct dashboard
                const targetRoute =
                    response.role === "ROLE_ADMIN" ? "/admin" : "/applicant";
                console.log("🔄 STEP 6: Navigating to:", targetRoute);
                navigate(targetRoute);

                console.log("🔄 STEP 7: Login process completed");
            } else {
                const errorMessage =
                    response?.message || "Login failed: No success response";
                setError(errorMessage);
                console.error("❌ STEP FAILED: Login failed:", errorMessage);
            }
        } catch (err) {
            console.error("💥 STEP FAILED: Login error:", err);

            // Handle different error formats
            let errorMessage = "Login failed. Please try again.";

            if (err.message) {
                errorMessage = err.message;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data) {
                errorMessage =
                    typeof err.response.data === "string"
                        ? err.response.data
                        : JSON.stringify(err.response.data);
            }

            setError(errorMessage);
        }
    };

    const handleBackToLanding = () => {
        navigate("/");
    };

    return (
        <div className="login-background">
            <div className="login-background-image"></div>

            {/* Back to Landing Page Button */}
            <button className="login-back-button" onClick={handleBackToLanding}>
                <FaArrowLeft className="login-back-icon" />
                Back to Landing Page
            </button>

            <div className="login-container">
                <div className="login-side">
                    <img src={logo} alt=""/>
                    <h2>AutoMate <br/> Traffic Department Services</h2>
                    <p>Your one-stop solution for licensing, fines management, and test bookings. Fast, secure, and convenient services at your fingertips.</p>
                </div>
                <div className="login-card">
                    {/* Header Section */}
                    <div className="login-header">
                        <h1 className="login-title">Sign in to AutoMate</h1>
                        <p className="login-subtitle">
                            Your one-stop solution for traffic services management
                        </p>
                    </div>

                    {error && (
                        <div className="login-error-message">{error}</div>
                    )}

                    {/* Email */}
                    <div className="login-input-group">
                        <label className="login-label">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                            placeholder="Enter your email address"
                        />
                    </div>

                    {/* Password */}
                    <div className="login-input-group">
                        <div className="login-password-header">
                            <label className="login-label">Password</label>
                            <Link to="/change-password" className="login-forgot-password">
                                Forgot your password?
                            </Link>
                        </div>
                        <div className="login-password-input-wrapper">
                            <input
                                type={showPass ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="login-input"
                                placeholder="Enter your password"
                            />
                            <button
                                className="login-toggle-password"
                                onClick={() => setShowPass(!showPass)}
                            >
                                {showPass ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="login-remember-me">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            className="login-checkbox"
                        />
                        <label htmlFor="remember" className="login-remember-label">
                            Remember me on this device
                        </label>
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="button"
                        className="login-sign-in-button"
                        onClick={handleLogin}
                    >
                        Sign in
                    </button>

                    {/* Sign Up Prompt */}
                    <div className="login-sign-up-section">
                        <p className="login-sign-up-text">
                            New to AutoMate?{" "}
                            <span
                                className="login-sign-up-link"
                                onClick={() =>
                                    navigate("/register", {
                                        state: { role: isApplicant ? "APPLICANT" : "ADMIN" },
                                    })
                                }
                            >
                Create account
              </span>
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="login-features">
                        <div className="login-feature-item">
                            <div className="login-feature-icon">✓</div>
                            <span className="login-feature-text">Secure & Reliable</span>
                        </div>
                        <div className="login-feature-item">
                            <div className="login-feature-icon">✓</div>
                            <span className="login-feature-text">24/7 Access</span>
                        </div>
                        <div className="login-feature-item">
                            <div className="login-feature-icon">✓</div>
                            <span className="login-feature-text">Easy Management</span>
                        </div>
                    </div>

                    {/* Security Note */}
                    <div className="login-security-section">
                        <p className="login-security-note">
                            If you use two-step authentication, keep your backup codes in a secure place.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}