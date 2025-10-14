import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ApiService from "../../services/ApiService";

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
    role: "APPLICANT", // Added role field with default value
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
    // Email validation based on selected role
    if (formData.role === "ADMIN" && !formData.email.endsWith("@admin.co.za")) {
      setError("Admin registration requires  valid email");
      return false;
    }
    
    if (formData.role === "APPLICANT" && !formData.email.includes("@")) {
      setError("Please enter a valid email address for applicant");
      return false;
    }

    // If user selected ADMIN but email doesn't match, show error
    if (formData.role === "ADMIN" && !formData.email.endsWith("@admin.co.za")) {
      setError("Failed to register enter a valid email for admin");
      return false;
    }

    // If user entered @admin.co.za email but selected APPLICANT, show error
    if (formData.role === "APPLICANT" && formData.email.endsWith("@admin.co.za")) {
      setError("Applicants cannot use admin email domain . Please use a different email or select Admin role.");
      return false;
    }

    const idRegex = /^[0-9]{13}$/;
    if (!idRegex.test(formData.idNumber)) {
      setError("ID Number must be exactly 13 digits.");
      return false;
    }

    // Extract birthdate from ID number
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
      role: formData.role, // Include role in payload
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
      console.log("Registered successfully:", result);
      
      // Show appropriate success message based on role
      if (formData.role === "ADMIN") {
        alert("Admin registration successful!");
      } else {
        alert("Applicant registration successful!");
      }
      
      onNext(payload);
      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Registration failed: " + (err.message || err));
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow p-4 w-100" style={{ maxWidth: 600 }}>
        <h3 className="text-center text-success fw-bold mb-4">
          AUTOMATED APP SYSTEM
        </h3>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Show info if admin role is selected */}
        {formData.role === "ADMIN" && (
          <div className="alert alert-info">
            <strong>Admin Registration</strong><br />
            You are registering as an administrator.
          </div>
        )}

        {/* Name */}
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="firstName"
              className="form-control"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="lastName"
              className="form-control"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* ID */}
        <div className="mb-3">
          <label className="form-label">ID Number</label>
          <input
            type="text"
            name="idNumber"
            className="form-control"
            value={formData.idNumber}
            onChange={handleChange}
            maxLength="13"
            required
          />
        </div>

        {/* Role Selection Dropdown - ADDED THIS */}
        <div className="mb-3">
          <label className="form-label">Register As</label>
          <select
            name="role"
            className="form-select"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="APPLICANT">Applicant</option>
            <option value="ADMIN">Administrator</option>
          </select>
          <small className="text-muted">
            {formData.role === "ADMIN" 
              ? "Admin accounts require email admin email"
              : "Applicant accounts can use any valid email"}
          </small>
        </div>

        {/* Contact */}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            placeholder={formData.role === "ADMIN" ? "your@email" : "your@email.com"}
            required
          />
          <small className="text-muted">
            {formData.role === "ADMIN" 
              ? "Admin email must be valid "
              : "Enter your email address"}
          </small>
        </div>

        <div className="mb-3">
          <label className="form-label">Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            className="form-control"
            value={formData.contactNumber}
            onChange={handleChange}
            required
          />
        </div>

        {/* Address */}
        <div className="mb-3">
          <label className="form-label">Street</label>
          <input
            type="text"
            name="street"
            className="form-control"
            value={formData.street}
            onChange={handleChange}
            required
          />
        </div>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">City</label>
            <input
              type="text"
              name="city"
              className="form-control"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col">
            <label className="form-label">Province</label>
            <input
              type="text"
              name="province"
              className="form-control"
              value={formData.province}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Country</label>
          <input
            type="text"
            name="country"
            className="form-control"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>

        {/* Date of Birth */}
        <div className="mb-3">
          <label className="form-label">Date of Birth</label>
          <div className="d-flex gap-2">
            <select
              name="dobMonth"
              className="form-select"
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
              className="form-select"
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
              className="form-select"
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
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <small className="text-muted">
            Password must be at least 8 characters with uppercase, lowercase, number, and special character
          </small>
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-control"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {/* Submit Button */}
        <button className="btn btn-primary w-100" onClick={handleSubmit}>
          Register as {formData.role === "ADMIN" ? "Administrator" : "Applicant"}
        </button>

        <div className="text-center mt-3 text-muted">
          Already have an account?{" "}
          <span
            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
            onClick={() => navigate("/")}
          >
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
}