import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import ApiService from "../../services/ApiService";
import logo from "../images/logo2.png";
import "./RegistrationStep1.css";

export default function RegistrationStep1({ onNext }) {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        idNumber: "",
        email: "",
        contactNumber: "",
        street: "",
        city: "",
        province: "",
        country: "",
        dobYear: "",
        dobMonth: "",
        dobDay: "",
        password: "",
        confirmPassword: "",
        role: "APPLICANT",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const calculateAge = (year, month, day) => {
        const today = new Date();
        const birthDate = new Date(year, month - 1, day);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const validateForm = () => {
        const requiredFields = [
            "firstName",
            "lastName",
            "idNumber",
            "email",
            "contactNumber",
            "street",
            "city",
            "province",
            "country",
            "dobYear",
            "dobMonth",
            "dobDay",
            "password",
            "confirmPassword"
        ];

        for (let field of requiredFields) {
            if (!formData[field] || formData[field].trim() === "") {
                setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1')}`);
                return false;
            }
        }

        if (formData.role === "ADMIN" && !formData.email.endsWith("@admin.co.za")) {
            setError("Admin registration requires valid email");
            return false;
        }

        if (formData.role === "APPLICANT" && !formData.email.includes("@")) {
            setError("Please enter a valid email address for applicant");
            return false;
        }

        if (formData.role === "ADMIN" && !formData.email.endsWith("@admin.co.za")) {
            setError("Failed to register enter a valid email for admin");
            return false;
        }

        if (formData.role === "APPLICANT" && formData.email.endsWith("@admin.co.za")) {
            setError("Applicants cannot use admin email domain. Please use a different email or select Admin role.");
            return false;
        }

        const idRegex = /^[0-9]{13}$/;
        if (!idRegex.test(formData.idNumber)) {
            setError("ID Number must be exactly 13 digits.");
            return false;
        }

        const idDobPart = formData.idNumber.substring(0, 6);
        const idYear = parseInt(idDobPart.substring(0, 2), 10);
        const idMonth = parseInt(idDobPart.substring(2, 4), 10);
        const idDay = parseInt(idDobPart.substring(4, 6), 10);

        const currentYear = new Date().getFullYear();
        const fullYear = idYear + (idYear <= currentYear % 100 ? 2000 : 1900);

        if (
            parseInt(formData.dobYear, 10) !== fullYear ||
            parseInt(formData.dobMonth, 10) !== idMonth ||
            parseInt(formData.dobDay, 10) !== idDay
        ) {
            setError("ID Number and Date of Birth do not match.");
            return false;
        }

        const password = formData.password.trim();
        const confirmPassword = formData.confirmPassword.trim();

        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecial = /[@$!%*?&]/.test(password);
        const hasLength = password.length >= 8;

        if (!hasLower) {
            setError("Password must include at least one lowercase letter.");
            return false;
        }
        if (!hasUpper) {
            setError("Password must include at least one uppercase letter.");
            return false;
        }
        if (!hasDigit) {
            setError("Password must include at least one number.");
            return false;
        }
        if (!hasSpecial) {
            setError("Password must include at least one special character (@$!%*?&).");
            return false;
        }
        if (!hasLength) {
            setError("Password must be at least 8 characters long.");
            return false;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }
        if (
            formData.dobYear &&
            formData.dobMonth &&
            formData.dobDay &&
            calculateAge(formData.dobYear, formData.dobMonth, formData.dobDay) < 18
        ) {
            setError("You must be at least 18 years old.");
            return false;
        }

        setError("");
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const birthDate = `${formData.dobYear}-${String(formData.dobMonth).padStart(
            2,
            "0"
        )}-${String(formData.dobDay).padStart(2, "0")}`;

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            idNumber: formData.idNumber,
            birthDate: birthDate,
            password: formData.password.trim(),
            role: `ROLE_${formData.role}`,
            contact: {
                email: formData.email,
                cellphone: formData.contactNumber,
            },
            address: {
                street: formData.street,
                city: formData.city,
                province: formData.province,
                country: formData.country,
            },
        };

        try {
            const result = await ApiService.registerUser(payload);
            console.log("Registration response:", result);

            if (result.success) {
                alert(`${formData.role} registration successful!`);
                onNext(payload);
                navigate("/");
            } else {
                setError(result.error);
                alert(`❌ Registration failed: ${result.error}`);
            }

        } catch (err) {
            console.error("Exception during registration:", err);
            alert("Registration failed due to a system error. Please try again.");
        }
    };

    const handleBackToLanding = () => {
        navigate("/");
    };

    return (
        <div className="registration-background">
            {/* Back to Landing Page Button */}
            <button className="registration-back-button" onClick={handleBackToLanding}>
                <FaArrowLeft className="registration-back-icon" />
                Back to Landing Page
            </button>

            <div className="registration-container">
                <div className="registration-side">
                    <img src={logo} alt="AutoMate Logo"/>
                    <h2>AutoMate <br/> Traffic Department Services</h2>
                    <p>Your one-stop solution for licensing, fines management, and test bookings. Fast, secure, and convenient services at your fingertips.</p>
                </div>

                <div className="registration-card">
                    {/* Header Section */}
                    <div className="registration-header">
                        <h1 className="registration-title">Create Account</h1>
                        <p className="registration-subtitle">
                            Join AutoMate and streamline your traffic services
                        </p>
                    </div>

                    {error && (
                        <div className="registration-error-message">{error}</div>
                    )}

                    {/* Show info if admin role is selected */}
                    {formData.role === "ADMIN" && (
                        <div className="registration-admin-alert">
                            <strong>Admin Registration</strong><br />
                            You are registering as an administrator.
                        </div>
                    )}

                    {/* Name */}
                    <div className="registration-row">
                        <div className="registration-col">
                            <label className="registration-label">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                className="registration-input"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="registration-col">
                            <label className="registration-label">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                className="registration-input"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* ID */}
                    <div className="registration-input-group">
                        <label className="registration-label">ID Number</label>
                        <input
                            type="text"
                            name="idNumber"
                            className="registration-input"
                            value={formData.idNumber}
                            onChange={handleChange}
                            maxLength="13"
                            required
                        />
                    </div>

                    {/* Role Selection Dropdown */}
                    <div className="registration-input-group">
                        <label className="registration-label">Register As</label>
                        <select
                            name="role"
                            className="registration-select"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="APPLICANT">Applicant</option>
                            <option value="ADMIN">Administrator</option>
                        </select>
                        <small className="registration-hint">
                            {formData.role === "ADMIN"
                                ? "Admin accounts require email admin email"
                                : "Applicant accounts can use any valid email"}
                        </small>
                    </div>

                    {/* Contact */}
                    <div className="registration-input-group">
                        <label className="registration-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="registration-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={formData.role === "ADMIN" ? "your@email" : "your@email.com"}
                            required
                        />
                        <small className="registration-hint">
                            {formData.role === "ADMIN"
                                ? "Admin email must be valid"
                                : "Enter your email address"}
                        </small>
                    </div>

                    <div className="registration-input-group">
                        <label className="registration-label">Contact Number</label>
                        <input
                            type="text"
                            name="contactNumber"
                            className="registration-input"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Address */}
                    <div className="registration-input-group">
                        <label className="registration-label">Street</label>
                        <input
                            type="text"
                            name="street"
                            className="registration-input"
                            value={formData.street}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="registration-row">
                        <div className="registration-col">
                            <label className="registration-label">City</label>
                            <input
                                type="text"
                                name="city"
                                className="registration-input"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="registration-col">
                            <label className="registration-label">Province</label>
                            <input
                                type="text"
                                name="province"
                                className="registration-input"
                                value={formData.province}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="registration-input-group">
                        <label className="registration-label">Country</label>
                        <input
                            type="text"
                            name="country"
                            className="registration-input"
                            value={formData.country}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Date of Birth */}
                    <div className="registration-input-group">
                        <label className="registration-label">Date of Birth</label>
                        <div className="registration-date-group">
                            <select
                                name="dobMonth"
                                className="registration-select"
                                value={formData.dobMonth}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Month</option>
                                {[
                                    "January","February","March","April","May","June",
                                    "July","August","September","October","November","December"
                                ].map((month, i) => (
                                    <option key={i} value={i + 1}>{month}</option>
                                ))}
                            </select>
                            <select
                                name="dobDay"
                                className="registration-select"
                                value={formData.dobDay}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Day</option>
                                {[...Array(31)].map((_, i) => (
                                    <option key={i} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                            <select
                                name="dobYear"
                                className="registration-select"
                                value={formData.dobYear}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Year</option>
                                {[...Array(100)].map((_, i) => (
                                    <option key={i} value={2025 - i}>{2025 - i}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="registration-input-group">
                        <label className="registration-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="registration-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <small className="registration-hint">
                            Password must be at least 8 characters with uppercase, lowercase, number, and special character
                        </small>
                    </div>
                    <div className="registration-input-group">
                        <label className="registration-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="registration-input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button className="registration-submit-button" onClick={handleSubmit}>
                        Register as {formData.role === "ADMIN" ? "Administrator" : "Applicant"}
                    </button>

                    <div className="registration-login-prompt">
                        Already have an account?{" "}
                        <span
                            className="registration-login-link"
                            onClick={() => navigate("/login")}
                        >
              Sign in
            </span>
                    </div>

                    {/* Features List */}
                    <div className="registration-features">
                        <div className="registration-feature-item">
                            <div className="registration-feature-icon">✓</div>
                            <span className="registration-feature-text">Secure & Reliable</span>
                        </div>
                        <div className="registration-feature-item">
                            <div className="registration-feature-icon">✓</div>
                            <span className="registration-feature-text">24/7 Access</span>
                        </div>
                        <div className="registration-feature-item">
                            <div className="registration-feature-icon">✓</div>
                            <span className="registration-feature-text">Easy Management</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}