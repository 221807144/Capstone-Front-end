import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../services/ApiService";
import "./Ticket.css";

const Ticket = ({ user }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("CARD");
    const [processingPayment, setProcessingPayment] = useState(false);

    const navigate = useNavigate();
    const getUserId = () => user?.userId || user?.id || localStorage.getItem("userId");

    useEffect(() => {
        const userId = getUserId();
        if (userId) fetchTickets(userId);
        else {
            setError("User not logged in. Please log in to view your tickets.");
            setLoading(false);
        }
    }, [user]);

    const fetchTickets = async (userId) => {
        try {
            setLoading(true);
            setError("");
            const ticketsResponse = await ApiService.getTicketsByApplicant(userId);
            setTickets(ticketsResponse || []);
        } catch (err) {
            console.error("Error fetching tickets:", err);
            setError("Failed to fetch tickets.");
        } finally {
            setLoading(false);
        }
    };

    const getVehicleDisplayName = (ticket) => {
        console.log(tickets);
        const vehicle = ticket.vehicle;
        console.log(vehicle)
        if (!vehicle) return "Unknown Vehicle";
        return `${vehicle.vehicleName || "Unknown"} ${vehicle.vehicleModel || "Vehicle"} (${vehicle.licensePlate || "No Plate"})`;
    }


    const handlePayTicket = (ticket) => {
        setSelectedTicket(ticket);
        setPaymentMethod("CARD");
        setShowPaymentForm(true);
    };

    //Hey Future me

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setProcessingPayment(true);

        try {
            const formData = new FormData(e.target);
            const userId = getUserId();

            if (!userId) {
                setError("User not identified. Please log in again.");
                return;
            }

            const paymentData = {
                paymentType: "Ticket",
                paymentMethod: paymentMethod === "Card" ? "Card" : "Cash",
                paymentAmount: selectedTicket.ticketAmount,
                paymentDate: new Date().toISOString().split('T')[0],
                paymentDetails: `Payment for vehicle ticket in violation of: ${selectedTicket.ticketType}`,
                user: { userId: parseInt(userId) }
            };

            if (paymentMethod === "CARD") {
                paymentData.cardholderName = formData.get('cardholderName');
                paymentData.cardNumber = formData.get('cardNumber');
                paymentData.expiryDate = formData.get('expiryDate');
                paymentData.cvv = parseInt(formData.get('cvv'));
            }

            console.log("Submitting payment for user:", userId, paymentData);

            const paymentResponse = await ApiService.createPayment(paymentData);
            console.log("Payment response:", paymentResponse);

            const updatedTicket = {
                ticketId: selectedTicket.ticketId,
                ticketAmount: selectedTicket.ticketAmount,
                issueDate: selectedTicket.issueDate,
                ticketType: selectedTicket.ticketType,
                status: "PAID",
                vehicle: selectedTicket.vehicle,
                payment: {
                    paymentId: paymentResponse.paymentId
                }
            };

            console.log("Updating ticket with:", updatedTicket);

            await ApiService.updateTicket(updatedTicket);

            alert("Payment processed successfully!");
            setShowPaymentForm(false);
            setSelectedTicket(null);

        } catch (err) {
            console.error("Payment error:", err);
            const errorMessage = err.response?.data?.message ||
                "Payment failed. Please try again.";
            setError(errorMessage);
        } finally {
            setProcessingPayment(false);
        }
    };

    const totalTickets = tickets.length;
    const totalDue = tickets
        .filter(ticket => ticket.status === "UNPAID")
        .reduce((sum, ticket) => sum + (ticket.ticketAmount || 0), 0);

    if (loading) return (
        <div className="ticket-container">
            <div className="loading-spinner"></div>
            <p>Loading your tickets...</p>
        </div>
    );

    return (
        <div className="ticket-container">
            <div className="ticket-header">
                <h2>My Traffic Tickets</h2>
                <p>View and manage all your traffic violations</p>
            </div>

            {error && <div className="error-message">{error}</div>}



            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card blue-card">
                    <h4>Total Tickets</h4>
                    <p>{totalTickets}</p>
                </div>
                <div className="summary-card blue-card">
                    <h4>Total Due</h4>
                    <p>R{totalDue.toFixed(2)}</p>
                </div>
            </div>

            {/* Tickets Grid */}
            {tickets.length === 0 ? (
                <div className="no-tickets">
                    <h3>No tickets found.</h3>
                </div>
            ) : (
                <div className="tickets-grid">
                    {tickets.map((ticket, index) => (
                        <div key={ticket.ticketId || index} className="ticket-card">
                            <div className="ticket-type-badge">{ticket.ticketType?.replace(/_/g, " ") || "Violation"}</div>
                            <h3>Ticket #{ticket.ticketId}</h3>
                            <p className="vehicle-info">
                                <strong>Vehicle:</strong>{" "}
                                {getVehicleDisplayName(ticket)}
                            </p>
                            <p><strong>Amount:</strong> R{ticket.ticketAmount}</p>
                            <p><strong>Status:</strong> {ticket.status}</p>
                            <p><strong>Issued:</strong> {ticket.issueDate ? new Date(ticket.issueDate).toLocaleDateString() : "Unknown"}</p>
                            {ticket.status === "UNPAID" && (
                                <button className="pay-button" onClick={() => handlePayTicket(ticket)} disabled={processingPayment}>
                                    {processingPayment ? "Processing..." : "Pay Now"}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Back Button */}
            <div className="back-button-container">
                <button className="back-button" onClick={() => navigate(-1)}> Back to dashboard</button>
            </div>

            {/* Payment Modal */}
            {showPaymentForm && selectedTicket && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal">
                        <h3>Pay Ticket #{selectedTicket.ticketId}</h3>
                        <form onSubmit={handlePaymentSubmit} className="payment-form">
                            <div className="form-group">
                                <label>Payment Method</label>
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                    <option value="CARD">Credit Card</option>
                                    <option value="CASH">Cash</option>
                                </select>
                            </div>

                            {paymentMethod === "CARD" && (
                                <>
                                    <div className="form-group">
                                        <label>Cardholder Name</label>
                                        <input name="cardholderName" placeholder="John Doe" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Card Number</label>
                                        <input name="cardNumber" placeholder="1234 5678 9012 3456" required />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Expiry Date</label>
                                            <input type="month" name="expiryDate" required />
                                        </div>
                                        <div className="form-group">
                                            <label>CVV</label>
                                            <input type="number" name="cvv" placeholder="123" required min="100" max="999" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {paymentMethod === "CASH" && (
                                <div className="cash-note">
                                    💵 Please pay at your nearest traffic department office.
                                </div>
                            )}

                            <div className="form-actions">
                                <button type="submit" className="submit-btn" disabled={processingPayment}>
                                    {processingPayment ? "Processing..." : "Confirm Payment"}
                                </button>
                                <button type="button" className="cancel-btn" onClick={() => setShowPaymentForm(false)} disabled={processingPayment}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ticket;
