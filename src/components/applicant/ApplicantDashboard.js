import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import SharedLayout from "../sharedPages/SharedLayout";
import ApiService from "../../services/ApiService";

// Import your service images
import learnersTestImg from "../images/car1.jpeg";
import driversTestImg from "../images/car2.jpg";
import registerVehicleImg from "../images/car3.jpg";
//import renewDiscImg from "../images/car4.jpg";
import payTicketImg from "../images/car5.jpg";
import disc from "../images/disc.jpg";
import learners from "../images/learners.jpg";

export default function ApplicantDashboard({ userData, bookings, vehicles }) {
  const navigate = useNavigate();
  const [hasLicense, setHasLicense] = useState(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseType, setLicenseType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [userLicenseInfo, setUserLicenseInfo] = useState(null);
  const [userVehicles, setUserVehicles] = useState([]);

  // made changes
  useEffect(() => {
    if (!userData || !userData.userId) {
      navigate("/login");
    } else {
      ApiService.getVehiclesByUser(userData.userId)
        .then((data) => setUserVehicles(data))
        .catch((err) => console.error(err));
    }
  }, [userData, navigate]);

  const handleLicenseSelection = (type) => {
    setLicenseType(type);
    setShowLicenseModal(true);
  };

  const saveLicenseInfo = () => {
    setUserLicenseInfo({ type: licenseType, number: licenseNumber });
    setHasLicense(licenseType);
    setShowLicenseModal(false);
    setLicenseNumber("");
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
     action: () =>
    navigate("/renew-disc", { state: { user: userData } }),
      requires: null,
    },
    {
      title: "Pay Traffic Ticket",
      description: "Pay outstanding traffic fines",
      image: payTicketImg,
      action: () => navigate("/pay-ticket"),
      requires: null,
    },
  ];

  // delete 
  const handleDeleteVehicle = (vehicleID) => {
  // Ask user for confirmation
  const confirmed = window.confirm("Are you sure you want to delete this vehicle?");
  if (confirmed) {
    ApiService.deleteVehicle(vehicleID)
      .then(() => {
        alert("Deleted successfully");
        // Remove the vehicle from state to update UI
        setUserVehicles(userVehicles.filter(v => v.vehicleID !== vehicleID));
      })
      .catch((err) => {
        console.error(err);
        alert("Couldn't delete the vehicle");
      });
  } else {
    alert("Vehicle not deleted");
  }
};


  const canAccessService = (service) => {
    if (!service.requires) return true;
    return userLicenseInfo && userLicenseInfo.type === service.requires;
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
            Effortless Vehicle Disc Registration
          </h1>
          <p className="lead mt-3 fs-4">
            Your one-stop solution for licensing, fines management, and test
            bookings
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
          backgroundSize: "70%", // fits image within the section
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
              {userLicenseInfo ? (
                <div className="card shadow-sm border-0 p-4 mb-4 rounded-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="fw-bold mb-1">
                        {userLicenseInfo.type === "license"
                          ? "Driver's License"
                          : "Learner's Permit"}
                      </h5>
                      <p className="mb-1 fw-medium">
                        License Number: {userLicenseInfo.number}
                      </p>
                      <p className="text-muted mb-0">Valid Until: 2028-05-15</p>
                    </div>
                    <div
                      style={{
                        width: "120px",
                        height: "70px",
                        backgroundColor: "#eaeaea",
                        borderRadius: "6px",
                      }}
                    ></div>
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
                        onClick={() => handleLicenseSelection("license")}
                      >
                        Driver's License
                      </button>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleLicenseSelection("learners")}
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
                      {bookings && bookings.length > 0 ? (
                        bookings.map((booking, index) => (
                          <div
                            key={index}
                            className="mb-3 p-3 bg-light rounded-3"
                          >
                            <h6 className="fw-medium mb-1">{booking.type}</h6>
                            <p className="text-muted small mb-0">
                              {booking.date}
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
                    {/* made changes */}
                    <div
                      className="card-body"
                      style={{ maxHeight: "400px", overflowY: "auto" }}
                    >
                      {userVehicles && userVehicles.length > 0 ? (
                        userVehicles.map((vehicle, index) => (
                          <div
                            key={index}
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
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                handleDeleteVehicle(vehicle.vehicleID)
                              }
                            >
                              Delete
                            </button>
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
                      disabled ? "bg-light" : "service-card"
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

      {/* License Modal */}
      {showLicenseModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  Enter Your{" "}
                  {licenseType === "license"
                    ? "Driver's License"
                    : "Learner's Permit"}{" "}
                  Number
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLicenseModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder={`Enter your ${licenseType}`}
                />
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
                  disabled={!licenseNumber.trim()}
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
    // </SharedLayout>
  );
}