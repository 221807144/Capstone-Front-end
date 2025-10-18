import React, {useState, useEffect} from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import ApiService from "./services/ApiService";

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
import SharedLayout from "./components/sharedPages/SharedLayout";
import VehicleProfile from "./components/applicant/VehicleProfile";
import Profile from "./components/applicant/Profile";

export default function App() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [payments, setPayments] = useState(0);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    // ✅ Check if user is already logged in on app start
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleVehicleRegistered = (vehicle) => {
        setVehicles((prev) => [...prev, vehicle]);
    };

    // ✅ Fixed handleLogin for JWT
    const handleLogin = (data) => {
        if (!data) return;

        console.log("📋 Login data received:", data);

        // Handle different response formats
        let userInfo, userRole, token;
        
        if (data.user) {
            // Format 1: { success: true, user: {...}, role: 'ROLE_...', token: '...' }
            userInfo = data.user;
            userRole = data.role;
            token = data.token;
        } else if (data.data && data.data.user) {
            // Format 2: { data: { user: {...}, role: 'ROLE_...', token: '...' } }
            userInfo = data.data.user;
            userRole = data.data.role;
            token = data.data.token;
        } else {
            // Format 3: Direct user object
            userInfo = data;
            userRole = data.role;
            token = data.token;
        }

        // Ensure we have the required fields
        const userData = {
            userId: userInfo.userId || userInfo.id,
            firstName: userInfo.firstName || 'User',
            lastName: userInfo.lastName || '',
            email: userInfo.contact?.email || userInfo.email,
            isApplicant: userRole === 'ROLE_APPLICANT',
            role: userRole,
            token: token
        };

        console.log("👤 Processed user data:", userData);
        setUser(userData);

        alert(
            `Login successful! Welcome ${userData.firstName} ${userData.lastName} (${
                userData.isApplicant ? "Applicant" : "Admin"
            })`
        );
    };

    const handleRegisterNext = (data) => {
        setUser({...data, isApplicant: true});
        alert("Personal details saved: " + JSON.stringify(data));
    };

    const handleBooking = (type, date) => {
        setBookings([...bookings, {type, date, user: user.firstName}]);
    };

    // ✅ Check authentication and role
    const isAuthenticated = ApiService.isAuthenticated();
    const userRole = ApiService.getCurrentUserRole();
    const isApplicant = userRole === 'ROLE_APPLICANT';
    const isAdmin = userRole === 'ROLE_ADMIN';

    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LoginScreen onLogin={handleLogin}/>}/>
                <Route path="/register" element={<RegistrationStep1 onNext={handleRegisterNext}/>}/>
                
                {/* Protected Applicant Routes */}
                <Route
                    path="/applicant"
                    element={
                        isAuthenticated && isApplicant ? (
                            <ApplicantDashboard userData={user} bookings={bookings} vehicles={vehicles}/>
                        ) : (
                            <Navigate to="/" replace/>
                        )
                    }
                />

                <Route
                    path="/VehicleRegistration"
                    element={
                        isAuthenticated && isApplicant ? (
                            <VehicleRegistration user={user} onComplete={handleVehicleRegistered}/>
                        ) : (
                            <Navigate to="/" replace/>
                        )
                    }
                />

                <Route
                    path="/vehicle-profile"
                    element={
                        isAuthenticated && isApplicant ? (
                            <VehicleProfile/>
                        ) : (
                            <Navigate to="/" replace/>
                        )
                    }
                />

                <Route
                    path="/vehicle-disc"
                    element={
                        isAuthenticated && isApplicant ? (
                            <VehicleDisc/>
                        ) : (
                            <Navigate to="/" replace/>
                        )
                    }
                />

                <Route
                    path="/pay-ticket"
                    element={
                        isAuthenticated && isApplicant ? (
                            <Ticket user={user}/>
                        ) : (
                            <Navigate to="/" replace/>
                        )
                    }
                />

                <Route
                    path="/booking-details/:id"
                    element={
                        isAuthenticated && isApplicant ? (
                            <BookingDetails/>
                        ) : (
                            <Navigate to="/" replace/>
                        )
                    }
                />

                <Route
                    path="/renew-disc"
                    element={
                        isAuthenticated && isApplicant ? (
                            <RenewDisc/>
                        ) : (
                            <Navigate to="/" replace/>
                        )
                    }
                />

                <Route
                    path="/payments"
                    element={
                        isAuthenticated && isApplicant ? (
                            <Payments user={user}/>
                        ) : (
                            <Navigate to="/" replace/>
                        )
                    }
                />

                {/* ✅ Booking route */}
                <Route
                    path="/booking"
                    element={
                        isAuthenticated && isApplicant ? (
                            <Booking onBook={(date) => handleBooking("Booking", date)}/>
                        ) : (
                            <Navigate to="/" replace/>
                        )
                    }
                />

                {/* Protected Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        isAuthenticated && isAdmin ? (
                            <AdminDashboard bookings={bookings} payments={payments}
                                            pendingApprovals={pendingApprovals}/>
                        ) : (
                            <Navigate to="/" replace/>
                        )
                    }
                />

                {/* Profile route - accessible to both roles */}
                <Route
                    path="/profile"
                    element={
                        isAuthenticated ? (
                            <Profile userId={user?.userId}/>
                        ) : (
                            <Navigate to="/" replace/>
                        )
                    }
                />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </Router>
    );
}