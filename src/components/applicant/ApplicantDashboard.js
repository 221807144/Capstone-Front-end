import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import SharedLayout from "../sharedPages/SharedLayout";
import ApiService from "../../services/ApiService";

// Import your service images
import learnersTestImg from "../images/car1.jpeg";
import driversTestImg from "../images/car2.jpg";
import registerVehicleImg from "../images/car3.jpg";
import payTicketImg from "../images/car5.jpg";
import disc from "../images/disc.jpg";
import learners from "../images/learners.jpg";

export default function ApplicantDashboard({ userData }) {
  const navigate = useNavigate();
  const [hasLicense, setHasLicense] = useState(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseType, setLicenseType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseIssueDate, setLicenseIssueDate] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const [userLicenseInfo, setUserLicenseInfo] = useState(null);
  const [userVehicles, setUserVehicles] = useState([]);
  const [userLicense, setUserLicense] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if no user data
  useEffect(() => {
    if (!userData || !userData.userId) {
      navigate("/login");
    }
  }, [userData, navigate]);

  // ✅ NEW: Refresh bookings if a new booking was just made
  useEffect(() => {
    const shouldRefresh = localStorage.getItem("refreshBookings");
    if (shouldRefresh) {
      localStorage.removeItem("refreshBookings");
      if (userData?.userId) {
        fetchUserBookings();
      }
    }
  }, [userData]);

  // Fetch user license information
  useEffect(() => {
    if (userData?.userId) {
      fetchUserLicense();
    }
  }, [userData]);

  // Fetch user vehicles
  useEffect(() => {
    if (userData?.userId) {
      fetchUserVehicles();
    }
  }, [userData]);

  // Fetch user bookings
  useEffect(() => {
    if (userData?.userId) {
      fetchUserBookings();
    }
  }, [userData]);

  const fetchUserLicense = async () => {
    try {
      // ✅ FIXED: Use the correct endpoint that exists in your backend
      // Based on your ApiService, you likely have licenses under applicants
      const response = await ApiService.getUserById(userData.userId);
      if (response) {
        // Check if user has license info in their profile
        if (response.licenseCode) {
          const normalizedType = response.licenseType?.toLowerCase() || "drivers";
          setUserLicense({
            licenseCode: response.licenseCode,
            licenseType: response.licenseType || "Driver's License",
            issueDate: response.issueDate || "N/A",
            expiryDate: response.expiryDate || null
          });
          setUserLicenseInfo({ 
            type: normalizedType, 
            number: response.licenseCode 
          });
          setHasLicense(true);
        }
      }
    } catch (error) {
      console.error("Error fetching user license:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVehicles = async () => {
    try {
      const data = await ApiService.getVehiclesByUser(userData.userId);
      setUserVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching user's vehicles:", error);
      setUserVehicles([]); // Ensure it's always an array
    }
  };

  const fetchUserBookings = async () => {
    try {
      const response = await ApiService.getUserBookings(userData.userId);
      if (response.success) {
        const bookings = Array.isArray(response.data) ? response.data : [response.data];
        const formattedBookings = bookings.map(booking => ({
          id: booking.testAppointmentId || booking.id,
          type: booking.testype === 'DRIVERSLICENSETEST' ? 'Drivers Test' : 'Learners Test',
          date: booking.testDate,
          time: booking.testTime,
          // ✅ Show correct status: Pending / Passed / Failed
          status: booking.testResult === null 
            ? 'Pending' 
            : booking.testResult 
              ? 'Passed' 
              : 'Failed'
        }));
        setUserBookings(formattedBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setUserBookings([]); // Ensure it's always an array
    }
  };

  const handleLicenseSelection = (type) => {
    setLicenseType(type);
    setShowLicenseModal(true);
  };

  // ✅ UPDATED: Now saves license info to the database with issue & expiry dates
  const saveLicenseInfo = async () => {
    try {
      // Validate required fields
      if (!licenseNumber.trim()) {
        alert("Please enter the license/permit number");
        return;
      }

      if (!licenseIssueDate) {
        alert("Please select the issue date");
        return;
      }

      if (!licenseExpiryDate) {
        alert("Please select the expiry date");
        return;
      }

      // Build the license object (matches your License entity)
      const licenseData = {
        licenseCode: licenseNumber,
        issueDate: licenseIssueDate,
        expiryDate: licenseExpiryDate,
      };

      // Build updated applicant object
      const updatedApplicant = { ...userData };

      // Save under "license" for driver's license, "learners" for learner's permit
      if (licenseType === "Driver's License") {
        updatedApplicant.license = licenseData;
        delete updatedApplicant.learners; // ensure learners is not sent
      } else if (licenseType === "Learner's Permit") {
  updatedApplicant.learners = {
    learnersCode: licenseNumber,
    issueDate: licenseIssueDate,
    expiryDate: licenseExpiryDate,
    // ✅ learnersId will be auto-generated by backend — no need to send it!
  };
        delete updatedApplicant.license; // ensure license is not sent
      }

      // Call your existing update method
      await ApiService.updateApplicant(updatedApplicant);

      // Update local state
      setUserLicenseInfo({ 
        type: licenseType.toLowerCase().includes("driver") ? "drivers" : "learners", 
        number: licenseNumber,
        issueDate: licenseIssueDate,
        expiryDate: licenseExpiryDate
      });
      setHasLicense(true);
      setShowLicenseModal(false);
      setLicenseNumber("");
      setLicenseIssueDate("");
      setLicenseExpiryDate("");
      
      // Refresh to show updated license
      fetchUserLicense();
    } catch (error) {
      console.error("Failed to save license info:", error);
      alert("Failed to save license information. Please try again.");
    }
  };

  const services = [
    {
      title: "Book Learners Test",
      description: "Schedule your learners license test",
      image: learners,
      action: () => navigate("/booking?type=learners", { state: { userData } }),
      requires: null,
    },
    {
      title: "Book Drivers Test",
      description: "Schedule your drivers license test",
      image: learnersTestImg,
      action: () => navigate("/booking?type=drivers", { state: { userData } }),
      requires: "learners",
    },
    {
      title: "Register Vehicle",
      description: "Register your vehicle and get disc",
      image: driversTestImg,
      action: () => navigate("/VehicleRegistration"),
      requires: null,
    },
    {
      title: "Renew Vehicle Disc",
      description: "Renew your vehicle disc",
      image: disc,
      action: () => navigate("/renew-disc", { state: { user: userData } }),
      requires: null,
    },
    {
      title: "Pay Traffic Ticket",
      description: "Pay outstanding traffic fines",
      image: payTicketImg,
      action: () => navigate("/pay-ticket"),
      requires: null,
    },
    {
      title: "Payments History",
      description: "View payments for the user",
      image: payTicketImg,
      action: () => navigate("/payments"),
      requires: null,
    },
  ];

  // delete vehicle
  const handleDeleteVehicle = async (vehicleID) => {
    const confirmed = window.confirm("Are you sure you want to delete this vehicle?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await ApiService.deleteVehicle(vehicleID);
      if (response && response === "Vehicle deleted successfully") {
        alert("Vehicle deleted successfully");
        setUserVehicles(prevVehicles =>
          prevVehicles.filter(v => v.vehicleID !== vehicleID)
        );
      } else {
        alert(response || "Could not delete vehicle. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error.response?.data || error.message);
      alert(error.response?.data || "An error occurred while deleting the vehicle.");
    }
  };

  // view vehicle
  const handleViewVehicle = (vehicle) => {
    navigate("/vehicle-profile", {
      state: {
        vehicle,
        user: userData,
      },
    });
  };

  // Fixed license type checking logic
  const canAccessService = (service) => {
    if (!service.requires) return true;
    
    if (!userLicenseInfo) return false;
    
    const licenseType = userLicenseInfo.type?.toLowerCase();
    
    if (service.requires === "learners") {
      return licenseType.includes("learner") || 
             licenseType.includes("learners") ||
             licenseType === "learnerslicense" ||
             licenseType === "learners" ||
             licenseType === "learner's permit";
    }
    
    return false;
  };

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      text: "This platform made my vehicle disc renewal process incredibly smooth and hassle-free. I highly recommend their service!",
      author: "SOPHIA R.",
      rating: 5,
    },
    {
      id: 2,
      text: "The ticket payment system saved me so much time. What used to take hours now takes minutes!",
      author: "MICHAEL T.",
      rating: 5,
    },
    {
      id: 3,
      text: "Booking my driver's test was incredibly easy. The whole process was straightforward and efficient.",
      author: "JAMES L.",
      rating: 4,
    },
  ];

  // Function to render star ratings
  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  // Handle loading state
  if (loading) {
    return (
      // <SharedLayout>
        <div className="container py-5">
          <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      // </SharedLayout>
    );
  }

  // Handle case where userData is not available
  if (!userData || !userData.userId) {
    return (
      // <SharedLayout>
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            <h4>User not found. Please login again.</h4>
            <button className="btn btn-primary mt-3" onClick={() => navigate("/login")}>
              Go to Login
            </button>
          </div>
        </div>
      // </SharedLayout>
    );
  }

  return (
    // <SharedLayout>
      <div className="container-fluid px-0">
        {/* Hero Section */}
        <section
          style={{
            width: "100%",
            minHeight: "450px",
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${driversTestImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            textAlign: "center",
            padding: "2rem 1rem",
          }}
        >
          <div className="px-3" style={{ maxWidth: "800px" }}>
            <h1 className="display-4 fw-bold mb-3">
              Welcome, {userData.firstName}!
            </h1>
            {userLicense && (
              <p className="lead mt-3 fs-4">
                License: {userLicense.licenseCode} ({userLicense.licenseType || "Driver's License"})
              </p>
            )}
            <p className="lead mt-3 fs-4">
              Your one-stop solution for licensing, fines management, and test bookings
            </p>
            <button
              className="btn btn-primary btn-lg mt-4 px-4 py-2"
              onClick={() =>
                document
                  .getElementById("services-section")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Services
            </button>
          </div>
        </section>

        {/* About Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="fw-bold mb-4">About Our Service</h2>
                <p className="lead text-muted">
                  At our core, we strive to simplify your vehicle-related
                  bureaucratic tasks. Our platform enables you to seamlessly
                  register for vehicle discs, pay off tickets swiftly, and easily
                  book appointments for learners and drivers tests.
                </p>
                <p className="text-muted">
                  We aim to save you time and provide peace of mind, ensuring
                  smooth processes for all your vehicular needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Full-width CTA Section */}
        <section
          className="py-5 rounded-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${registerVehicleImg})`,
            backgroundSize: "70%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center text-white">
                <h2 className="display-5 fw-bold mb-4">Ready to Get Started?</h2>
                <p className="lead mb-4">
                  Join thousands of satisfied customers who have simplified their
                  vehicle documentation process with our services.
                </p>
                <button
                  className="btn btn-primary btn-lg px-4 py-2"
                  onClick={() =>
                    document
                      .getElementById("services-section")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore Our Services
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* User Info Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="text-center mb-5">
                  <h2 className="fw-bold">Your Driving Information</h2>
                  <p className="text-muted">
                    Please let us know which license(s) you currently hold. This
                    helps us provide you with the right services.
                  </p>
                </div>

                {/* License Info */}
                {userLicense ? (
                  <div className="card shadow-sm border-0 p-4 mb-4 rounded-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="fw-bold mb-1">
                          {userLicense.licenseType || "Driver's License"}
                        </h5>
                        <p className="mb-1 fw-medium">
                          License Number: {userLicense.licenseCode}
                        </p>
                        <p className="text-muted mb-0">
                          Issue Date: {userLicense.issueDate}
                          {userLicense.expiryDate && ` | Expiry Date: ${userLicense.expiryDate}`}
                        </p>
                      </div>
                      <div
                        style={{
                          width: "120px",
                          height: "70px",
                          backgroundColor: "#eaeaea",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          color: "#666"
                        }}
                      >
                        LICENSE
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card shadow-sm border-0 p-4 mb-4 rounded-4">
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-around">
                      <h5 className="me-3 text-center text-md-start mb-3 mb-md-0">
                        Do you have a driver's license or learner's permit?
                      </h5>
                      <div>
                        <button
                          className="btn btn-outline-primary me-2 mb-2 mb-md-0"
                          onClick={() => handleLicenseSelection("Driver's License")}
                        >
                          Driver's License
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleLicenseSelection("Learner's Permit")}
                        >
                          Learner's Permit
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Bookings & My Vehicles */}
                <div className="row mt-4">
                  <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                      <div className="card-header bg-primary text-white fw-bold">
                        Recent Bookings
                      </div>
                      <div className="card-body">
                        {userBookings && userBookings.length > 0 ? (
                          userBookings.slice(0, 3).map((booking, index) => (
                            <div
                              key={booking.id || index}
                              className="mb-3 p-3 bg-light rounded-3"
                            >
                              <h6 className="fw-medium mb-1">{booking.type}</h6>
                              {/* ✅ ADDED: Explicit labels for Date, Time, Status */}
                              <p className="text-muted small mb-0">
                                <strong>Data:</strong> {booking.date} <br />
                                <strong>Time:</strong> {booking.time || 'N/A'} <br />
                                <strong>Status:</strong> {booking.status}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted">No bookings yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                      <div className="card-header bg-primary text-white fw-bold">
                        My Vehicles
                      </div>
                      <div
                        className="card-body"
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                      >
                        {userVehicles && userVehicles.length > 0 ? (
                          userVehicles.map((vehicle, index) => (
                            <div
                              key={vehicle.vehicleID || index}
                              className="mb-3 p-3 bg-light rounded-3 d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <h6 className="fw-medium mb-1">
                                  {vehicle.vehicleName}
                                </h6>
                                <p className="text-muted small mb-0">
                                  License Number: {vehicle.licensePlate}
                                </p>
                              </div>

                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleViewVehicle(vehicle)}
                                >
                                  View
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() =>
                                    handleDeleteVehicle(vehicle.vehicleID)
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted">No vehicles registered yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services-section" className="py-5">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="fw-bold">SERVICES</h2>
              <div
                className="mx-auto"
                style={{
                  height: "3px",
                  width: "80px",
                  backgroundColor: "#0d6efd",
                }}
              ></div>
            </div>

            <div className="row g-4">
              {services.map((service, index) => {
                const disabled = service.requires && !canAccessService(service);
                return (
                  <div key={index} className="col-12 col-md-6 col-lg-4">
                    <div
                      className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden ${
                        disabled ? "bg-light" : ""
                      }`}
                      style={{
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: disabled ? 0.6 : 1,
                        transition: "transform 0.3s, box-shadow 0.3s",
                      }}
                      onClick={disabled ? null : service.action}
                      onMouseOver={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.transform = "translateY(-5px)";
                          e.currentTarget.style.boxShadow =
                            "0 12px 24px rgba(0,0,0,0.15)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 6px rgba(0,0,0,0.1)";
                        }
                      }}
                    >
                      <div
                        style={{
                          height: "200px",
                          backgroundImage: `url(${service.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>
                      <div className="card-body text-center p-4">
                        <h4 className="fw-bold mb-3">{service.title}</h4>
                        <p className="text-muted mb-0">{service.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="fw-bold">TESTIMONIALS</h2>
              <div
                className="mx-auto"
                style={{
                  height: "3px",
                  width: "80px",
                  backgroundColor: "#0d6efd",
                }}
              ></div>
            </div>

            <div className="row g-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
                    <div className="text-warning mb-3 fs-5">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="fst-italic mb-4">"{testimonial.text}"</p>
                    <p className="fw-bold text-primary mb-0">
                      {testimonial.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* License Modal */} //made changes
        {showLicenseModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    Enter Your {licenseType} Details
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowLicenseModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Enter Your {licenseType} Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder={`Enter your ${licenseType} number`}
                      required
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Issue Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={licenseIssueDate}
                        onChange={(e) => setLicenseIssueDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={licenseExpiryDate}
                        onChange={(e) => setLicenseExpiryDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowLicenseModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={saveLicenseInfo}
                    disabled={!licenseNumber.trim() || !licenseIssueDate || !licenseExpiryDate}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showLicenseModal && <div className="modal-backdrop show"></div>}
      </div>
    // {/* // </SharedLayout> */}
  );
}