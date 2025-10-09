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
    const [paymentMethod, setPaymentMethod] = useState("Card");
    const [processingPayment, setProcessingPayment] = useState(false);

    // State for card payment details
    const [cardDetails, setCardDetails] = useState({
        cardholderName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
    });

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
        const vehicle = ticket.vehicle;
        if (!vehicle) return "Unknown Vehicle";
        return `${vehicle.vehicleName || "Unknown"} ${vehicle.vehicleModel || "Vehicle"} (${vehicle.licensePlate || "No Plate"})`;
    };

    const handlePayTicket = (ticket) => {
        setSelectedTicket(ticket);
        setPaymentMethod("Card");
        setCardDetails({
            cardholderName: "",
            cardNumber: "",
            expiryDate: "",
            cvv: "",
        });
        setShowPaymentForm(true);
    };

    // Format card number as user types
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        value = value.substring(0, 16);
        const formatted = value.replace(/(.{4})/g, "$1 ").trim();
        setCardDetails((prev) => ({ ...prev, cardNumber: formatted }));
    };

    const formatExpiryDate = (expiry) => {
        if (!expiry || !expiry.includes("/")) return null;

        const [month, year] = expiry.split("/");
        // Assume year is two digits -> convert to 20YY
        const fullYear = `20${year}`;
        // Set day as "01" to make a full valid date string
        return `${fullYear}-${month.padStart(2, "0")}-01`;
    };


    const handleCardDetailChange = (e) => {
        const { name, value } = e.target;
        setCardDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, ""); // remove non-digits
        if (value.length >= 3) {
            value = value.substring(0, 4);
            value = value.replace(/^(\d{2})(\d{1,2})$/, "$1/$2"); // insert slash after 2 digits
        }
        setCardDetails((prev) => ({ ...prev, expiryDate: value }));
    };


    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setProcessingPayment(true);

        try {
            const userId = getUserId();
            if (!userId) {
                setError("User not identified. Please log in again.");
                return;
            }

            const paymentData = {
                paymentType: "Ticket",
                paymentMethod, // "Card" or "Cash"
                paymentAmount: selectedTicket.ticketAmount,
                paymentDate: new Date().toISOString().split("T")[0],
                paymentDetails: `Payment for vehicle ticket in violation of: ${selectedTicket.ticketType}`,
                user: { userId: parseInt(userId) },
            };

            if (paymentMethod === "Card") {
                const [month, year] = cardDetails.expiryDate.split("/");
                const formattedExpiry = `20${year}-${month.padStart(2, "0")}-01`;

                paymentData.cardholderName = cardDetails.cardholderName;
                paymentData.cardNumber = cardDetails.cardNumber.replace(/\s/g, "");
                paymentData.expiryDate = formatExpiryDate(cardDetails.expiryDate);
                paymentData.cvv = parseInt(cardDetails.cvv);
            }

            console.log("Submitting payment:", paymentData);
            console.log("🪪 Card details:", cardDetails);

            const paymentResponse = await ApiService.createPayment(paymentData);
            console.log("Payment response:", paymentResponse);

            const updatedTicket = {
                ...selectedTicket,
                status: "PAID",
                payment: { paymentId: paymentResponse.paymentId },
            };

            await ApiService.updateTicket(updatedTicket);
            alert("Payment processed successfully!");

            setShowPaymentForm(false);
            setSelectedTicket(null);
            await fetchTickets(userId);
        } catch (err) {
            console.error("Payment error:", err);
            const errorMessage = err.response?.data?.message || "Payment failed. Please try again.";
            setError(errorMessage);
        } finally {
            setProcessingPayment(false);
        }
    };

    const totalTickets = tickets.length;
    const totalDue = tickets
        .filter(ticket => ticket.status === "UNPAID")
        .reduce((sum, ticket) => sum + (ticket.ticketAmount || 0), 0);

    if (loading) {
        return (
            <div className="ticket-container">
                <div className="loading-spinner"></div>
                <p>Loading your tickets...</p>
            </div>
        );
    }

    return (
        <div className="ticket-container">
            <div className="ticket-header">
                <h2>My Traffic Tickets</h2>
                <p>View and manage all your traffic violations</p>
            </div>

            {error && <div className="error-message">{error}</div>}

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

            {tickets.length === 0 ? (
                <div className="no-tickets">
                    <h3>No tickets found.</h3>
                </div>
            ) : (
                <div className="tickets-grid">
                    {tickets.map((ticket, index) => (
                        <div key={ticket.ticketId || index} className="ticket-card">
                            <div className="ticket-type-badge">
                                {ticket.ticketType?.replace(/_/g, " ") || "Violation"}
                            </div>
                            <h3>Ticket #{ticket.ticketId}</h3>
                            <p className="vehicle-info">
                                <strong>Vehicle:</strong> {getVehicleDisplayName(ticket)}
                            </p>
                            <p><strong>Amount:</strong> R{ticket.ticketAmount}</p>
                            <p><strong>Status:</strong> {ticket.status}</p>
                            <p>
                                <strong>Issued:</strong>{" "}
                                {ticket.issueDate
                                    ? new Date(ticket.issueDate).toLocaleDateString()
                                    : "Unknown"}
                            </p>
                            {ticket.status === "UNPAID" && (
                                <button
                                    className="pay-button"
                                    onClick={() => handlePayTicket(ticket)}
                                    disabled={processingPayment}
                                >
                                    {processingPayment ? "Processing..." : "Pay Now"}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="back-button-container">
                <button className="back-button" onClick={() => navigate(-1)}>
                    Back to dashboard
                </button>
            </div>

            {showPaymentForm && selectedTicket && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal">
                        <h3>Pay Ticket #{selectedTicket.ticketId}</h3>
                        <form onSubmit={handlePaymentSubmit} className="payment-form">
                            <div className="form-group">
                                <label>Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                </select>
                            </div>

                            {paymentMethod === "Card" && (
                                <>
                                    <div className="form-group">
                                        <label>Cardholder Name</label>
                                        <input
                                            name="cardholderName"
                                            placeholder="John Doe"
                                            required
                                            autoComplete="cc-name"
                                            value={cardDetails.cardholderName}
                                            onChange={handleCardDetailChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Card Number</label>
                                        <input
                                            name="cardNumber"
                                            placeholder="1234 5678 9012 3456"
                                            required
                                            value={cardDetails.cardNumber}
                                            onChange={handleCardNumberChange}
                                            inputMode="numeric"
                                            maxLength="19"
                                            autoComplete="cc-number"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Expiry Date (MM/YY)</label>
                                            <input
                                                type="text"
                                                name="expiryDate"
                                                placeholder="MM/YY"
                                                required
                                                maxLength="5"
                                                autoComplete="cc-exp"
                                                value={cardDetails.expiryDate}
                                                onChange={handleExpiryChange}
                                                inputMode="numeric"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>CVV</label>
                                            <input
                                                type="password"
                                                name="cvv"
                                                placeholder="123"
                                                required
                                                minLength="3"
                                                maxLength="3"
                                                inputMode="numeric"
                                                autoComplete="cc-csc"
                                                value={cardDetails.cvv}
                                                onChange={handleCardDetailChange}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {paymentMethod === "Cash" && (
                                <div className="cash-note">
                                    💵 Please pay at your nearest traffic department office.
                                </div>
                            )}

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={processingPayment}
                                >
                                    {processingPayment ? "Processing..." : "Confirm Payment"}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowPaymentForm(false)}
                                    disabled={processingPayment}
                                >
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
