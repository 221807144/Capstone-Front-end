import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, CreditCard, CheckCircle } from "lucide-react";
import SharedLayout from "../sharedPages/SharedLayout";
import ApiService from "../../services/ApiService";
import { calculateExpiryDate } from "../applicant/utils/DateHelpers";

function VehicleRegistration({ user, onClose, onComplete }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        vehicleName: "",
        vehicleType: "",
        vehicleModel: "",
        vehicleYear: "",
        vehicleColor: "",
        engineNumber: "",
        chassisNumber: "",
        licensePlate: "",
        paymentMethod: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
    });

    const registrationFee = 850;
    const issueDate = new Date();
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCancel = () => {
        if (onClose) onClose();
        else navigate(-1);
    };

    const handleContinue = async () => {
        // Step 1: Validate vehicle info
        if (step === 1) {
            const requiredFields = [
                "vehicleName",
                "vehicleType",
                "vehicleModel",
                "vehicleYear",
                "vehicleColor",
                "engineNumber",
                "chassisNumber",
            ];
            for (let field of requiredFields) {
                if (!formData[field]) {
                    setError("Please fill in all required vehicle fields");
                    return;
                }
            }
            setError("");
            setStep(2);
            return;
        }

        // Step 2: Validate payment method
        if (!formData.paymentMethod) {
            setError("Please select a payment method");
            return;
        }

        // Card-specific validation
        if (formData.paymentMethod === "Card") {
            const { cardNumber, expiryDate, cvv, cardholderName } = formData;
            if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
                setError("Please fill in all card details");
                return;
            }

            if (!/^\d{16}$/.test(cardNumber)) {
                setError("Card number must be exactly 16 digits");
                return;
            }

            if (!/^\d{3}$/.test(cvv)) {
                setError("CVV must be exactly 3 digits");
                return;
            }

            const [month, year] = expiryDate.split("/").map((v) => parseInt(v, 10));
            const currentMonth = new Date().getMonth() + 1;
            const currentYearShort = new Date().getFullYear() % 100;
            if (!month || !year || month < 1 || month > 12 || year < currentYearShort || (year === currentYearShort && month < currentMonth)) {
                setError("Card expiry date cannot be in the past and must be MM/YY");
                return;
            }
        }

        setError("");
        if (!user || (!user.userId && !user.id)) {
            setError("User not logged in. Please log in first.");
            return;
        }

        // Compute expiry date of vehicle disc
        const vehicleYear = parseInt(formData.vehicleYear, 10);
        const expiryDate = calculateExpiryDate(vehicleYear);

        const vehiclePayload = {
            vehicleName: formData.vehicleName,
            vehicleType: formData.vehicleType,
            vehicleModel: formData.vehicleModel,
            vehicleYear: formData.vehicleYear,
            vehicleColor: formData.vehicleColor,
            licensePlate: formData.licensePlate,
            engineNumber: formData.engineNumber,
            chassisNumber: formData.chassisNumber,
            applicant: { userId: user.userId },
            vehicleDisc: {
                issueDate: issueDate.toISOString(),
                expiryDate: expiryDate.toISOString(),
                registrationFee,
                status: "active",
                payment: {
                    paymentType: "Disc",
                    paymentMethod: formData.paymentMethod,
                    paymentAmount: registrationFee,
                    paymentDate: new Date().toISOString(),
                    paymentDetails: "Payment for vehicle disc",
                    cardholderName: formData.cardholderName || null,
                    cardNumber: formData.cardNumber || null,
                    cvv: formData.cvv || null,
                    expiryDate: formData.expiryDate
                        ? new Date(
                            "20" + formData.expiryDate.split("/")[1],
                            formData.expiryDate.split("/")[0] - 1
                        ).toISOString()
                        : null,
                    user: { userId: user.userId },
                },
            },
        };

        try {
            console.log("Registered vehicle:", vehiclePayload);
            const response = await ApiService.registerVehicle(vehiclePayload);
            if (onComplete) onComplete(response || vehiclePayload);
            setSuccess(true);
        } catch (err) {
            console.error("Registration error:", err);
            alert("Failed to register vehicle. Check console for details.");
        }
    };

    // Styles
    const containerStyle = {
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #eff6ff, #dbeafe)",
        padding: "48px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    };
    const cardStyle = {
        backgroundColor: "white",
        borderRadius: "24px",
        padding: "40px",
        maxWidth: "700px",
        width: "100%",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb",
    };
    const headerStyle = { textAlign: "center", marginBottom: "40px" };
    const iconWrapperStyle = {
        backgroundColor: "#dbeafe",
        padding: "16px",
        borderRadius: "50%",
        display: "inline-flex",
        marginBottom: "16px",
    };
    const titleStyle = { fontSize: "32px", fontWeight: "bold", color: "#111827" };
    const subtitleStyle = { fontSize: "16px", color: "#4b5563", marginTop: "8px" };
    const inputStyle = { width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", outline: "none", fontSize: "14px", marginBottom: "12px", backgroundColor: "white" };
    const selectStyle = { ...inputStyle, backgroundColor: "white" };
    const buttonStyle = { flex: 1, padding: "14px", fontWeight: "bold", borderRadius: "12px", cursor: "pointer", border: "none", fontSize: "16px" };
    const cancelButtonStyle = { ...buttonStyle, backgroundColor: "white", color: "#374151", border: "1px solid #d1d5db", marginRight: "12px" };
    const submitButtonStyle = { ...buttonStyle, background: "linear-gradient(to right, #2563eb, #4f46e5)", color: "white" };
    const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" };

    return (
        <SharedLayout>
            <div style={containerStyle}>
                <div style={cardStyle}>
                    {!success ? (
                        <>
                            <div style={headerStyle}>
                                <div style={iconWrapperStyle}>
                                    {step === 1 ? <Car size={40} color="#2563eb" /> : <CreditCard size={40} color="#2563eb" />}
                                </div>
                                <h1 style={titleStyle}>Vehicle Registration</h1>
                                <p style={subtitleStyle}>{step === 1 ? "Enter vehicle details" : "Complete payment to finish registration"}</p>
                            </div>

                            <form onSubmit={(e) => e.preventDefault()}>
                                {/* Step 1: Vehicle Details */}
                                {step === 1 && (
                                    <>
                                        <div style={gridStyle}>
                                            <div>
                                                <label>Vehicle Name</label>
                                                <input type="text" name="vehicleName" value={formData.vehicleName} onChange={handleChange} placeholder="e.g., Toyota" style={inputStyle} />
                                            </div>
                                            <div>
                                                <label>Vehicle Type</label>
                                                <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} style={selectStyle}>
                                                    <option value="">Select Type</option>
                                                    <option value="CAR">Car</option>
                                                    <option value="TRUCK">Truck</option>
                                                    <option value="MOTORCYCLE">Motorcycle</option>
                                                    <option value="BUS">Bus</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={gridStyle}>
                                            <div>
                                                <label>Model</label>
                                                <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="e.g., Corolla" style={inputStyle} />
                                            </div>
                                            <div>
                                                <label>Year</label>
                                                <select name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} style={selectStyle}>
                                                    <option value="">Select Year</option>
                                                    {years.map((year) => (<option key={year} value={year}>{year}</option>))}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={gridStyle}>
                                            <div>
                                                <label>Color</label>
                                                <input type="text" name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} placeholder="e.g., White" style={inputStyle} />
                                            </div>
                                            <div>
                                                <label>Engine Number</label>
                                                <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} placeholder="Engine number" style={inputStyle} />
                                            </div>
                                        </div>

                                        <div style={gridStyle}>
                                            <div>
                                                <label>Chassis Number</label>
                                                <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} placeholder="Chassis number" style={inputStyle} />
                                            </div>
                                            <div>
                                                <label>License Plate</label>
                                                <input type="text" name="licensePlate" value={formData.licensePlate} onChange={(e) => {
                                                    let value = e.target.value.toUpperCase().slice(0, 7);
                                                    setFormData({ ...formData, licensePlate: value });
                                                }} placeholder="e.g., CA12345" style={inputStyle} maxLength={7} />
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                                            <button type="button" onClick={handleCancel} style={cancelButtonStyle}>Cancel</button>
                                            <button type="button" onClick={handleContinue} style={submitButtonStyle}>Continue to Payment</button>
                                        </div>
                                    </>
                                )}

                                {/* Step 2: Payment */}
                                {step === 2 && (
                                    <>
                                        <div style={{ background: "#eff6ff", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
                                            <p><strong>Registration Fee:</strong> R {registrationFee}</p>
                                            <p><strong>Disc Issue Date:</strong> {issueDate.toLocaleDateString()}</p>
                                            <p><strong>Disc Expiry Date:</strong> {calculateExpiryDate(parseInt(formData.vehicleYear, 10)).toLocaleDateString()}</p>
                                        </div>

                                        <div>
                                            <label>Payment Type</label>
                                            <input type="text" value="Vehicle Registration" readOnly style={inputStyle} />
                                        </div>

                                        <div>
                                            <label>Payment Method</label>
                                            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} style={inputStyle}>
                                                <option value="">Select Payment Method</option>
                                                <option value="Card">Card</option>
                                                <option value="Cash">Cash</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label>Payment Details</label>
                                            <input type="text" value="Payment for vehicle disc" readOnly style={inputStyle} />
                                        </div>

                                        {/* Card details only if Card selected */}
                                        {formData.paymentMethod === "Card" && (
                                            <>
                                                <div>
                                                    <label>Cardholder Name</label>
                                                    <input type="text" name="cardholderName" value={formData.cardholderName} onChange={handleChange} placeholder="Full name on card" style={inputStyle} />
                                                </div>

                                                <div>
                                                    <label>Card Number</label>
                                                    <input type="text" name="cardNumber" value={formData.cardNumber} onChange={(e) => {
                                                        let value = e.target.value.replace(/\D/g, "").slice(0, 16);
                                                        setFormData({ ...formData, cardNumber: value });
                                                    }} placeholder="1234567812345678" style={inputStyle} />
                                                </div>

                                                <div style={gridStyle}>
                                                    <div>
                                                        <label>Expiry Date</label>
                                                        <input type="text" name="expiryDate" value={formData.expiryDate} onChange={(e) => {
                                                            let value = e.target.value.replace(/\D/g, "").slice(0, 4);
                                                            if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2);
                                                            setFormData({ ...formData, expiryDate: value });
                                                        }} placeholder="MM/YY" style={inputStyle} maxLength={5} />
                                                    </div>
                                                    <div>
                                                        <label>CVV</label>
                                                        <input type="text" name="cvv" value={formData.cvv} onChange={(e) => {
                                                            let value = e.target.value.replace(/\D/g, "").slice(0, 3);
                                                            setFormData({ ...formData, cvv: value });
                                                        }} placeholder="123" style={inputStyle} maxLength={3} />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {error && <p style={{ color: "red", fontWeight: "bold", marginTop: "12px" }}>{error}</p>}

                                        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                                            <button type="button" onClick={() => setStep(1)} style={cancelButtonStyle}>Back</button>
                                            <button type="button" onClick={handleContinue} style={submitButtonStyle}>
                                                Pay R {registrationFee} & Register
                                            </button>
                                        </div>
                                    </>
                                )}
                            </form>
                        </>
                    ) : (
                        <div style={{ textAlign: "center", padding: "40px" }}>
                            <CheckCircle size={60} color="green" />
                            <h2 style={{ fontSize: "24px", fontWeight: "bold", marginTop: "20px" }}>🎉 Registration Successful!</h2>
                            <p style={{ marginTop: "10px", color: "#4b5563" }}>Your vehicle has been registered.</p>

                            <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "12px" }}>
                                <button onClick={handleCancel} style={{ padding: "12px 20px", borderRadius: "12px", background: "#374151", color: "white", border: "none", cursor: "pointer" }}>Close</button>
                                <button onClick={() => navigate("/vehicle-disc", { state: { vehicle: formData, user } })} style={{ padding: "12px 20px", borderRadius: "12px", background: "#2563eb", color: "white", border: "none", cursor: "pointer" }}>View Disc</button>
                                <button onClick={() => navigate("/applicant")} style={{ padding: "12px 20px", borderRadius: "12px", background: "#10b981", color: "white", border: "none", cursor: "pointer" }}>Home</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SharedLayout>
    );
}

export default VehicleRegistration;
