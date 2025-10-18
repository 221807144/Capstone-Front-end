import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle, FaChevronDown } from "react-icons/fa";
import ApiService from "../../services/ApiService";
import backgroundImage from "../images/automate-logo.png";

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
    console.log("🔑 Stored token:", localStorage.getItem('token'));
    console.log("👤 Stored user:", localStorage.getItem('user'));
    console.log("🎯 Stored role:", localStorage.getItem('role'));

    if (response && response.success) {
      console.log("🔄 STEP 3: Login successful, processing user data...");
      
      // Get user data from response
      const userFromResponse = response.user;
      console.log("📋 User data from response:", userFromResponse);
      
      // Show welcome alert
      const userName = userFromResponse.firstName || 'User';
      alert(`Welcome ${userName}!`);
      console.log("🔄 STEP 4: Welcome alert shown");

      // Pass the complete response to parent App.js
      console.log("🔄 STEP 5: Calling onLogin callback");
      onLogin(response);

      // ✅ ADD THIS: Navigate to the correct dashboard
      const targetRoute = response.role === 'ROLE_ADMIN' ? "/admin" : "/applicant";
      console.log("🔄 STEP 6: Navigating to:", targetRoute);
      navigate(targetRoute);

      console.log("🔄 STEP 7: Login process completed");
    } else {
      const errorMessage = response?.message || "Login failed: No success response";
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
      errorMessage = typeof err.response.data === 'string' 
        ? err.response.data 
        : JSON.stringify(err.response.data);
    }
    
    setError(errorMessage);
  }
};

  return (
    <div style={styles.background}>
      <div style={styles.backgroundImage}></div>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Sign in to AutoMate</h1>

          {error && (
            <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>
          )}

          {/* User Type Dropdown */}
          <div style={styles.dropdownContainer}>
            <button
              style={styles.dropdownButton}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {isApplicant ? "Applicant Login" : "Admin Login"}
              <FaChevronDown style={{ marginLeft: 8 }} />
            </button>
            {showDropdown && (
              <div style={styles.dropdownMenu}>
                <button
                  style={{
                    ...styles.dropdownItem,
                    backgroundColor: isApplicant ? "#f6f7f9" : "transparent",
                  }}
                  onClick={() => {
                    setIsApplicant(true);
                    setShowDropdown(false);
                  }}
                >
                  Applicant Login
                </button>
                <button
                  style={{
                    ...styles.dropdownItem,
                    backgroundColor: !isApplicant ? "#f6f7f9" : "transparent",
                  }}
                  onClick={() => {
                    setIsApplicant(false);
                    setShowDropdown(false);
                  }}
                >
                  Admin Login
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Enter your email address"
            />
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <div style={styles.passwordHeader}>
              <label style={styles.label}>Password</label>
              <Link to="/forgot-password" style={styles.forgotPassword}>
                Forgot your password?
              </Link>
            </div>
            <div style={styles.passwordInputWrapper}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Enter your password"
              />
              <button
                style={styles.togglePassword}
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={styles.rememberMe}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              style={styles.checkbox}
            />
            <label htmlFor="remember" style={styles.rememberLabel}>
              Remember me on this device
            </label>
          </div>

          {/* Sign In Button */}
          <button style={styles.signInButton} onClick={handleLogin}>
            Sign in
          </button>

          {/* Divider */}
          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>OR</span>
            <span style={styles.dividerLine}></span>
          </div>

          {/* Google Sign In */}
          <button style={styles.googleButton}>
            <FaGoogle style={styles.googleIcon} />
            Sign in with Google
          </button>

          {/* Sign Up Prompt */}
          <p style={styles.signUpText}>
            New to AutoMate?{" "}
            <span
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
              onClick={() =>
                navigate("/register", {
                  state: { role: isApplicant ? "APPLICANT" : "ADMIN" },
                })
              }
            >
              Create account
            </span>
          </p>

          {/* Security Note */}
          <p style={styles.securityNote}>
            If you use two-step authentication, keep your backup codes in a
            secure place.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  background: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "20px",
    overflow: "hidden",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(8px)",
    zIndex: -1,
    opacity: 0.7,
  },
  container: {
    width: "100%",
    maxWidth: "480px",
    padding: "0 20px",
    zIndex: 1,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    padding: "32px",
    width: "100%",
    backdropFilter: "blur(4px)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "32px",
    color: "#1a1a1a",
    textAlign: "center",
  },
  dropdownContainer: {
    position: "relative",
    marginBottom: "24px",
  },
  dropdownButton: {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    color: "#1a1a1a",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    marginTop: "4px",
    zIndex: 10,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  dropdownItem: {
    width: "100%",
    padding: "12px 16px",
    textAlign: "left",
    border: "none",
    backgroundColor: "transparent",
    fontSize: "14px",
    cursor: "pointer",
    color: "#1a1a1a",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  passwordHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
    color: "#1a1a1a",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
  },
  passwordInputWrapper: {
    position: "relative",
  },
  togglePassword: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#806b7bff",
    cursor: "pointer",
  },
  forgotPassword: {
    fontSize: "13px",
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: "500",
  },
  rememberMe: {
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
  },
  checkbox: {
    marginRight: "12px",
    width: "16px",
    height: "16px",
    accentColor: "#6366f1",
    cursor: "pointer",
  },
  rememberLabel: {
    fontSize: "14px",
    color: "#4b5563",
    cursor: "pointer",
  },
  signInButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "24px",
    cursor: "pointer",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    padding: "0 12px",
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
  },
  googleButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "white",
    color: "#1a1a1a",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "24px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    marginRight: "8px",
    color: "#db4437",
  },
  signUpText: {
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px",
  },
  signUpLink: {
    color: "#1013d5ff",
    fontWeight: "500",
    textDecoration: "none",
  },
  securityNote: {
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: "1.5",
    textAlign: "center",
    marginTop: "24px",
  },
};