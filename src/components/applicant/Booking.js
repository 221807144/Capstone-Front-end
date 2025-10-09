import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import SharedLayout from "../sharedPages/SharedLayout";
import ApiService from "../../services/ApiService";

const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Try to get userData from location.state or localStorage
  const storedUser = JSON.parse(localStorage.getItem("userData"));
  const userData = location.state?.userData || storedUser;

  // Get the test type from URL parameters
  const testType = searchParams.get("type") || "learners";

  const [formData, setFormData] = useState({
    testAddress: "",
    testVenue: "",
    testDate: "",
    testTime: "",
    licenseCode: "",
    notes: "",
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    paymentMethod: "Card",
  });

  const [loading, setLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ FIXED: Added licenseType mapping for proper dashboard integration
  const testTypes = {
    learners: {
      title: "Book Learners Test",
      description: "Schedule your learners license test",
      fee: 250,
      icon: "📝",
      testType: "LEARNERSLICENSETEST",
      licenseType: "learners", // ← Critical for dashboard license checking
    },
    drivers: {
      title: "Book Drivers Test",
      description: "Schedule your drivers license test",
      fee: 450,
      icon: "🚗",
      testType: "DRIVERSLICENSETEST",
      licenseType: "drivers", // ← Critical for dashboard license checking
    },
  };

  useEffect(() => {
    if (testTypes[testType]) {
      setCurrentTest(testTypes[testType]);
    } else {
      setCurrentTest(testTypes["learners"]);
    }
  }, [testType]);

  // Add redirect effect if no user data
  useEffect(() => {
    if (!userData || !userData.userId) {
      navigate("/login");
    }
  }, [userData, navigate]);

  const testVenues = [
    {
      name: "Cape Town Testing Center",
      address: "123 Main Street, Cape Town",
    },
    {
      name: "Johannesburg Testing Center",
      address: "456 Oak Avenue, Johannesburg",
    },
    {
      name: "Durban Testing Center",
      address: "789 Beach Road, Durban",
    },
    {
      name: "Port Elizabeth Testing Center",
      address: "Broadwalk Road, Gqeberha",
    },
  ];

  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePaymentChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;

    if (name === "cardNumber") {
      value = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
      if (value.length > 19) value = value.substring(0, 19);
    }

    if (name === "expiryDate") {
      value = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
      if (value.length > 5) value = value.substring(0, 5);
    }

    if (name === "cvv") {
      value = value.replace(/\D/g, "");
      if (value.length > 4) value = value.substring(0, 4);
    }

    setPaymentData({
      ...paymentData,
      [name]: value,
    });
  };

  const handleVenueChange = (e) => {
    const selectedVenue = testVenues.find(
      (venue) => venue.name === e.target.value
    );
    setFormData({
      ...formData,
      testVenue: selectedVenue.name,
      testAddress: selectedVenue.address,
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !formData.testDate ||
      !formData.testTime ||
      !formData.testVenue ||
      !formData.licenseCode
    ) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Check that userData exists
      if (!userData || !userData.userId) {
        setErrorMessage("User not found. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
        setLoading(false);
        return;
      }

      const formatExpiryDate = (expiry) => {
        if (!expiry || !expiry.includes("/")) {
          throw new Error("Invalid expiry date format, expected MM/YY");
        }
        const [month, year] = expiry.split("/");
        return `20${year}-${month.padStart(2, "0")}-01`; // YYYY-MM-DD
      };

      const paymentRequestData = {
        paymentType: "Booking",
        paymentMethod: paymentData.paymentMethod,
        paymentAmount: currentTest.fee,
        paymentDate: new Date().toISOString().split("T")[0],
        paymentDetails: `Payment for ${currentTest.testType}`,
        ...(paymentData.paymentMethod === "Card" && {
          cardholderName: paymentData.cardholderName,
          cardNumber: parseInt(paymentData.cardNumber.replace(/\s/g, ""), 10),
          expiryDate: formatExpiryDate(paymentData.expiryDate),
          cvv: parseInt(paymentData.cvv, 10),
        }),
        user: { userId: userData.userId },
      };

      const appointmentData = {
        testAddress: formData.testAddress,
        testVenue: formData.testVenue,
        testDate: formData.testDate,
        testTime: formData.testTime ? formData.testTime + ":00" : null,
        testResult: null,
        licenseCode: formData.licenseCode,
        testype: currentTest.testType,
        testAmount: currentTest.fee,
        payment: paymentRequestData,
        applicant: {
          userId: userData.userId,
        },
      };

      console.log("Sending appointment with payment:", appointmentData);
      const bookingRes = await ApiService.createTestAppointment(appointmentData);

      if (bookingRes.success) {
        setBookingId(
          bookingRes.data.testAppointmentId || bookingRes.data.id
        );
        setPaymentSuccess(true);
        
        // ✅ CRITICAL FIX: Navigate back to dashboard without passing stale data
        // This forces the dashboard to fetch fresh data from the database
        setTimeout(() => {
          navigate("/applicant");
        }, 2000);
      } else {
        const errorDetail =
          bookingRes.error?.message ||
          (typeof bookingRes.error === "string"
            ? bookingRes.error
            : JSON.stringify(bookingRes.error));
        setErrorMessage(`Booking failed: ${errorDetail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Payment/Booking error:", error);
      setErrorMessage(error.message || "Error processing booking");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while test type is being determined
  if (!currentTest) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If payment was successful, show confirmation
  if (paymentSuccess) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-header bg-success text-white">
                <h5 className="card-title mb-0">Booking & Payment Successful!</h5>
              </div>
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="80"
                    fill="currentColor"
                    className="bi bi-check-circle-fill text-success"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                  </svg>
                </div>
                <h4 className="mb-3">Thank You for Your Booking!</h4>
                <p className="text-muted mb-4">
                  Your {currentTest.title} has been confirmed and your payment of{" "}
                  <strong>R {currentTest.fee}</strong> was processed successfully.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/applicant")}
                  >
                    Go to Dashboard
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate(`/booking-details/${bookingId}`)}
                  >
                    View Booking Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SharedLayout>
      <div className="container py-4" style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div className="text-center mb-5">
          <div className="d-flex justify-content-center align-items-center mb-3">
            <span className="display-1 me-3">{currentTest.icon}</span>
          </div>
          <h1 className="mb-2">{currentTest.title}</h1>
          <p className="text-muted">{currentTest.description}</p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            <strong>Error:</strong> {errorMessage}
            <button
              type="button"
              className="btn-close float-end"
              onClick={() => setErrorMessage("")}
              aria-label="Close"
            ></button>
          </div>
        )}

        {!showPaymentForm ? (
          /* Booking Form */
          <div className="card shadow-lg">
            <div className="card-body p-4">
              {/* Fee Info */}
              <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
                <div>
                  <strong>Test Fee:</strong>
                  <p className="mb-0 small">
                    Complete your booking and proceed to payment
                  </p>
                </div>
                <span className="fw-bold fs-4">R {currentTest.fee}</span>
              </div>

              <form onSubmit={handleBookingSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="testDate" className="form-label fw-medium">
                      Test Date *
                    </label>
                    <input
                      type="date"
                      id="testDate"
                      name="testDate"
                      className="form-control"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.testDate}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="testTime" className="form-label fw-medium">
                      Test Time *
                    </label>
                    <select
                      id="testTime"
                      name="testTime"
                      className="form-select"
                      required
                      value={formData.testTime}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select a time slot</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 mb-3">
                    <label htmlFor="testVenue" className="form-label fw-medium">
                      Testing Venue *
                    </label>
                    <select
                      id="testVenue"
                      name="testVenue"
                      className="form-select"
                      required
                      value={formData.testVenue}
                      onChange={handleVenueChange}
                      disabled={loading}
                    >
                      <option value="">Select a venue</option>
                      {testVenues.map((venue) => (
                        <option key={venue.name} value={venue.name}>
                          {venue.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.testVenue && (
                    <div className="col-12 mb-3">
                      <label className="form-label fw-medium">
                        Venue Address
                      </label>
                      <div className="form-control bg-light">
                        {testVenues.find((v) => v.name === formData.testVenue)
                          ?.address}
                      </div>
                    </div>
                  )}

                  <div className="col-12 mb-3">
                    <label
                      htmlFor="licenseCode"
                      className="form-label fw-medium"
                    >
                      License Code *
                    </label>
                    <input
                      type="text"
                      id="licenseCode"
                      name="licenseCode"
                      className="form-control"
                      required
                      placeholder="Enter your license or learner's permit code"
                      value={formData.licenseCode}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <div className="form-text">
                      {testType === "learners"
                        ? "If you don't have a license code yet, enter your ID number"
                        : "Enter your current driver's license or learner's permit code"}
                    </div>
                  </div>

                  <div className="col-12 mb-4">
                    <label htmlFor="notes" className="form-label fw-medium">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      className="form-control"
                      rows="3"
                      placeholder="Any special requirements or notes..."
                      value={formData.notes}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ minWidth: "150px" }}
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">Payment Details</h5>
            </div>
            <div className="card-body p-4">
              <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
                <div>
                  <strong>Amount to Pay:</strong>
                  <p className="mb-0 small">
                    Complete your payment to confirm booking
                  </p>
                </div>
                <span className="fw-bold fs-4">R {currentTest.fee}</span>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                {/* Payment Method Selection */}
                <div className="mb-3">
                  <label htmlFor="paymentMethod" className="form-label">
                    Payment Method
                  </label>
                  <select
                    className="form-select"
                    id="paymentMethod"
                    name="paymentMethod"
                    value={paymentData.paymentMethod}
                    onChange={handlePaymentChange}
                    disabled={loading}
                  >
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                {/* Card Details (only show for card payments) */}
                {paymentData.paymentMethod === "Card" && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="cardholderName" className="form-label">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="cardholderName"
                        name="cardholderName"
                        required
                        value={paymentData.cardholderName}
                        onChange={handlePaymentChange}
                        placeholder="Full name as on card"
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="cardNumber" className="form-label">
                        Card Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="cardNumber"
                        name="cardNumber"
                        required
                        value={paymentData.cardNumber}
                        onChange={handlePaymentChange}
                        placeholder="1234 5678 9012 3456"
                        disabled={loading}
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="expiryDate" className="form-label">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="expiryDate"
                          name="expiryDate"
                          required
                          value={paymentData.expiryDate}
                          onChange={handlePaymentChange}
                          placeholder="MM/YY"
                          disabled={loading}
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="cvv" className="form-label">
                          CVV
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="cvv"
                          name="cvv"
                          required
                          value={paymentData.cvv}
                          onChange={handlePaymentChange}
                          placeholder="123"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Security notice */}
                <div className="alert alert-warning mb-4">
                  <i className="bi bi-shield-check me-2"></i>
                  Your payment information is secure and encrypted.
                </div>

                {/* Action buttons */} //made changes
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPaymentForm(false)}
                    disabled={loading}
                  >
                    Back to Booking
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Processing Payment...
                      </>
                    ) : (
                      `Pay R ${currentTest.fee}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-4">
          <div className="alert alert-warning">
            <h5 className="alert-heading">Important Information</h5>
            <ul className="mb-0">
              <li>Please arrive 15 minutes before your scheduled test time</li>
              <li>Bring your ID document and any required paperwork</li>
              <li>Payment is required to confirm your booking</li>
              <li>
                Cancellations must be made at least 24 hours in advance for a
                refund
              </li>
            </ul>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
};

export default Booking;