import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginScreen from "./components/SingUpLogin/LoginScreen";
import RegistrationStep1 from "./components/SingUpLogin/RegistrationStep1";
import ApplicantDashboard from "./components/applicant/ApplicantDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import VehicleRegistration from "./components/applicant/VehicleRegistration";
import VehicleDisc from "./components/applicant/VehicleDisc";
import Ticket from "./components/applicant/Ticket";
import Booking from "./components/applicant/Booking";
import BookingDetails from "./components/applicant/BookingDetails";
import RenewDisc from "./components/applicant/RenewDisc";
import Payments from "./components/applicant/Payment"
import Profile from "./components/applicant/Profile";
import SharedLayout from "./components/sharedPages/SharedLayout";

export default function App() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const handleVehicleRegistered = (vehicle) => {
    setVehicles((prev) => [...prev, vehicle]);
  };
 // Fixed handleLogin
  const handleLogin = (data) => {
    if (!data) return;

    // data should include isApplicant from LoginScreen
    setUser({ ...data, isApplicant: data.isApplicant });

    alert(
      `Login successful! Welcome ${data.firstName} ${
        data.lastName || ""
      } (${data.isApplicant ? "Applicant" : "Admin"})`
    );
  };

  const handleRegisterNext = (data) => {
    setUser({ ...data, isApplicant: true });
    alert("Personal details saved: " + JSON.stringify(data));
  };

  const handleBooking = (type, date) => {
    setBookings([...bookings, { type, date, user: user.firstName }]);
  };

  return (
    <Router >
      <Routes>
        <Route path="/" element={<LoginScreen onLogin={handleLogin} />} />
        <Route path="/register" element={<RegistrationStep1 onNext={handleRegisterNext} />} />
        <Route path="/payments" element={<Payments user={user} />} />

    <Route
  path="/applicant"
  element={
    user && user.isApplicant ? (
      <SharedLayout user={user}>
        <ApplicantDashboard userData={user} bookings={bookings} vehicles={vehicles} />
      </SharedLayout>
    ) : (
      <LoginScreen onLogin={handleLogin} />
    )
  }
/>


        <Route
          path="/VehicleRegistration"
          element={
            user && user.isApplicant ? (
              <VehicleRegistration user={user} onComplete={handleVehicleRegistered} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="/vehicle-disc" element={<VehicleDisc />} />
        <Route path="/pay-ticket" element={<Ticket />} />
        <Route path="/booking-details/:id" element={<BookingDetails />} />
        <Route path="/renew-disc" element={<RenewDisc />} />

        <Route
  path="/profile"
  element={
    user ? (
      <Profile user={user} />
    ) : (
      <Navigate to="/" replace />
    )
  }
/>


        {/* ✅ Booking route saves to backend now */}
        <Route
          path="/booking"
          element={
            user && user.isApplicant ? (
              <Booking onBook={(date) => handleBooking("Booking", date)} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin"
          element={
            user && !user.isApplicant ? (
              <AdminDashboard bookings={bookings} payments={payments} pendingApprovals={pendingApprovals} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
       
      </Routes>
    </Router>
  );
}
