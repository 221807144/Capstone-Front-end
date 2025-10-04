import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ApiService from "../../services/ApiService";
import "./Payment.css";

export default function Payments({ user }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState("All"); // 🔹 filter state
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.userId) {
            setError("User not logged in");
            setLoading(false);
            return;
        }
        fetchPayments();
    }, [user]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            setError(null);

            const paymentsData = await ApiService.getAllPayments();
            if (!Array.isArray(paymentsData)) {
                setPayments([]);
                return;
            }

            const userPayments = paymentsData.filter(payment => {
                return payment.userId === user.userId ||
                    (payment.user && payment.user.userId === user.userId) ||
                    (payment.applicant && payment.applicant.userId === user.userId);
            });

            setPayments(userPayments);
        } catch (err) {
            setError("Failed to fetch payments. Please try again later.");
            console.error("Error fetching payments:", err);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToDashboard = () => {
        navigate("/applicant");
    };

    // 🔹 Apply filter
    const filteredPayments = filterType === "All"
        ? payments
        : payments.filter(p => p.paymentType === filterType);

    if (loading) {
        return (
            <div className="payments-container d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payments-container container py-5">
                <div className="alert alert-danger text-center fs-5">{error}</div>
                <div className="text-center">
                    <button className="btn btn-outline-primary" onClick={handleBackToDashboard}>
                        <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payments-container">
            <div className="container py-5" style={{ minHeight: "80vh" }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="text-center flex-grow-1">
                        <h2 className="fw-bold">Payment History</h2>
                        <div
                            className="mx-auto"
                            style={{
                                height: "3px",
                                width: "80px",
                                backgroundColor: "#0d6efd",
                            }}
                        ></div>
                    </div>
                </div>

                {/* 🔹 Filter Dropdown */}
                <div className="mb-4 text-end">
                    <label className="me-2 fw-semibold">Filter by Type:</label>
                    <select
                        className="form-select d-inline-block"
                        style={{ width: "200px" }}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="All">All</option>
                        <option value="Ticket">Ticket</option>
                        <option value="Booking">Booking</option>
                        <option value="Disc">Disc</option>
                    </select>
                </div>

                {filteredPayments.length === 0 ? (
                    <div className="text-center">
                        <div className="alert alert-info text-center fs-5">
                            No payment history found {filterType !== "All" ? `for ${filterType}` : ""}
                        </div>
                        <button
                            className="btn btn-outline-primary"
                            onClick={handleBackToDashboard}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table table-hover table-bordered align-middle">
                                <thead className="table-primary">
                                <tr>
                                    <th scope="col">Payment ID</th>
                                    <th scope="col">Amount</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Method</th>
                                    <th scope="col">Details</th>
                                    <th scope="col">Cardholder Name</th>
                                    <th scope="col">Card Number</th>
                                    <th scope="col">Expiry Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.paymentId}>
                                        <td>{payment.paymentId}</td>
                                        <td>R {payment.paymentAmount?.toFixed(2) || "0.00"}</td>
                                        <td>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "-"}</td>
                                        <td>{payment.paymentType || "-"}</td>
                                        <td>{payment.paymentMethod || "-"}</td>
                                        <td>{payment.paymentDetails || "-"}</td>
                                        <td>{payment.paymentMethod === "Card" ? payment.cardholderName : "-"}</td>
                                        <td>
                                            {payment.paymentMethod === "Card" && payment.cardNumber
                                                ? `**** **** **** ${payment.cardNumber.toString().slice(-4)}`
                                                : "-"}
                                        </td>
                                        <td>
                                            {payment.paymentMethod === "Card" && payment.expiryDate
                                                ? new Date(payment.expiryDate).toLocaleDateString()
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-center mt-4">
                            <button className="btn btn-primary" onClick={handleBackToDashboard}>
                                Back to Dashboard
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
