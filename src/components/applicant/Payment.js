import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ApiService from "../../services/ApiService";
import "./Payment.css"; // We'll create this CSS file

export default function Payments({ user }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.userId) {
            setError("User not logged in");
            setLoading(false);
            return;
        }

        ApiService.getAllPayments()
            .then((data) => {
                // Filter payments for the current user
                const userPayments = data.filter(
                    (payment) => payment.user && payment.user.userId === user.userId
                );
                setPayments(userPayments);
                setLoading(false);
            })
            .catch((err) => {
                setError("Failed to fetch payment history");
                setLoading(false);
                console.error("Payment fetch error:", err);
            });
    }, [user]);

    const handleBackToDashboard = () => {
        navigate("/applicant");
    };

    if (loading) {
        return (
            <div className="payments-container">
                <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
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

                {payments.length === 0 ? (
                    <div className="text-center">
                        <div className="alert alert-info text-center fs-5">
                            No payment history found
                        </div>
                        <button
                        className="btn btn-outline-primary"
                        onClick={handleBackToDashboard}
                        style={{ whiteSpace: 'nowrap' }}
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
                                {payments.map((payment) => (
                                    <tr key={payment.paymentId}>
                                        <td>{payment.paymentId}</td>
                                        <td>R {payment.paymentAmount.toFixed(2)}</td>
                                        <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                        <td>{payment.paymentType}</td>
                                        <td>{payment.paymentMethod}</td>
                                        <td>{payment.paymentDetails}</td>
                                        <td>{payment.paymentMethod === "Card" ? payment.cardholderName : "-"}</td>
                                        <td>
                                            {payment.paymentMethod === "Card"
                                                ? `**** **** **** ${payment.cardNumber.toString().slice(-4)}`
                                                : "-"}
                                        </td>
                                        <td>
                                            {payment.paymentMethod === "Card"
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