import React, {useEffect, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom"; // <- import useLocation
import {CheckCircle} from "lucide-react";
import SharedLayout from "../sharedPages/SharedLayout";
import ApiService from "../../services/ApiService";
import {calculateExpiryDate} from "../applicant/utils/DateHelpers";

export default function RenewDisc() {
    const [renewedVehicle, setRenewedVehicle] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();          // <- add this
    const user = location.state?.user;
    // This is the crucial line: get the expiredDiscs from the navigation state
    // const expiredDiscs = location.state?.expiredDiscs;

    console.log("RenewDisc component mounted");
    console.log("Received user:", user);
    // console.log("Received expired discs:", expiredDiscs);
    const [vehicleList, setVehicleList] = useState([]);
    const [step, setStep] = useState(1);
    const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const registrationFee = 850;
    const [paymentMethod, setPaymentMethod] = useState("");
    const [cardDetails, setCardDetails] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
    });

    // // Helper to strip time from a date
    // const dateOnly = (date) => {
    //   const d = new Date(date);
    //   d.setHours(0, 0, 0, 0);
    //   return d;
    // };


    // Fetch expired discs for logged-in user
    useEffect(() => {
        if (!user?.userId) return; //made changes
        console.log("useEffect triggered", user);

        const fetchExpired = async () => {
            try {
                if (!user || !user.userId) return;
                const data = await ApiService.getExpiredVehiclesByUser(user.userId);

                console.log("Fetched vehicles:", data);
                setVehicleList(data);
            } catch (err) {
                console.error("Error fetching expired vehicles:", err);
            }
        };
        fetchExpired();
    }, [user]);

// // Filter expired vehicles ignoring time
// const expiredVehicles = vehicleList.filter(
//   (v) =>
//     v.vehicleDisc?.expiryDate &&
//     dateOnly(v.vehicleDisc.expiryDate) <= dateOnly(new Date())
// );

    const expiredVehicles = vehicleList;

    const handleSelectVehicle = (index) => {
        setSelectedVehicleIndex(index);
        setStep(2);
        setError("");
    };

    const handleCardChange = (e) => {
        const {name, value} = e.target;
        setCardDetails((prev) => ({...prev, [name]: value}));
    };

    const handleRenew = async () => {
        if (selectedVehicleIndex === null) return;

        if (!paymentMethod) {
            setError("Please select a payment method");
            return;
        }

        if (paymentMethod === "Card") {
            const {cardNumber, expiryDate, cvv, cardholderName} = cardDetails;

            if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
                setError("Please fill in all card details");
                return;
            }

            if (!/^\d{16}$/.test(cardNumber)) {
                setError("Card number must be 16 digits");
                return;
            }

            if (!/^\d{3}$/.test(cvv)) {
                setError("CVV must be 3 digits");
                return;
            }

            const [month, year] = expiryDate.split("/").map(Number);
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear() % 100;

            if (!month || !year || month < 1 || month > 12) {
                setError("Expiry date must be in MM/YY format");
                return;
            }

            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                setError("Card expiry date cannot be in the past");
                return;
            }
        }

        setError("");
        const updatedVehicles = [...vehicleList];
        const vehicle = updatedVehicles[selectedVehicleIndex];

        // --- RENEWAL LOGIC ---
        // 1 year from today, ignoring vehicle year for simplicity
        const today = new Date(); // <-- define today here
        const newExpiry = new Date(
            today.getFullYear() + 1,
            today.getMonth(),
            today.getDate()
        );
// made changes here
//     // const newExpiry = new Date();
//     // newExpiry.setFullYear(newExpiry.getFullYear() + 1);

//     const vehicleYear = parseInt(vehicle.vehicleYear, 10);
// let newExpiry = new Date();

// if (vehicleYear < 2024) {
//   newExpiry = new Date(); // today
// } else {
//   newExpiry.setFullYear(newExpiry.getFullYear() + 1); // +1 year
// }

// // Strip time to avoid midnight issues
// newExpiry = new Date(newExpiry.getFullYear(), newExpiry.getMonth(), newExpiry.getDate());

// const vehicleYear = parseInt(vehicle.vehicleYear, 10);
// const newExpiry = calculateExpiryDate(vehicleYear);


        try {

            // 1️⃣ Create payment first
            const paymentData = {
                paymentType: "Disc",
                paymentMethod,
                paymentDetails: `Vehicle disc renewal for ${vehicle.licensePlate}`,
                paymentAmount: registrationFee,
                paymentDate: new Date().toISOString(),
                paymentStatus: "Completed",
                cardNumber: paymentMethod === "Card" ? cardDetails.cardNumber : null,
                expiryDate: paymentMethod === "Card" ? cardDetails.expiryDate : null,
                cvv: paymentMethod === "Card" ? cardDetails.cvv : null,
                cardholderName: paymentMethod === "Card" ? cardDetails.cardholderName : null,
                user: { userId: user.userId }, // if your backend expects the user attached
            };

            // Call your payment endpoint
            const payment = await ApiService.createPayment(paymentData);
            console.log("Payment created:", payment);


            await ApiService.createVehicleDisc({
                discId: vehicle.vehicleDisc.discId,
                issueDate: new Date().toISOString().split("T")[0],
                expiryDate: newExpiry.toISOString().split("T")[0],
                payment,
            });

            // Update local list (keep date format consistent with your list — string or Date)
            updatedVehicles[selectedVehicleIndex].vehicleDisc = {
                ...updatedVehicles[selectedVehicleIndex].vehicleDisc,
                issueDate: today.toISOString().split("T")[0],
                expiryDate: newExpiry.toISOString().split("T")[0],
            };
            setVehicleList(updatedVehicles);

            // Prepare object to pass to VehicleDisc
            const vehicleForDisc = {
                ...vehicle,
                // readable fields VehicleDisc expects (use ISO strings)
                discIssueDate: today.toISOString(),
                discExpiryDate: newExpiry.toISOString(),
                // also update nested vehicleDisc if VehicleDisc reads that
                vehicleDisc: {
                    ...vehicle.vehicleDisc,
                    issueDate: today.toISOString().split("T")[0],
                    expiryDate: newExpiry.toISOString().split("T")[0],
                },
                status: "Renewed",
            };

            setRenewedVehicle(vehicleForDisc); // save so UI can show the new expiry
            setSuccess(true); // show success screen (do NOT navigate immediately)

        } catch (err) {
            console.error("Error renewing vehicle disc:", err);
            setError("Failed to renew disc. Try again.");
        }
    };

    return (
        <SharedLayout>
            <div className="container mt-4">
                <button
                    className="btn btn-secondary mb-3"
                    onClick={() => navigate("/applicant")}
                    style={{
                        padding: "12px 20px",
                        borderRadius: "12px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    &larr; Back
                </button>
                {!success ? (
                    <>
                        <h2 className="mb-4">Renew Vehicle Disc</h2>

                        {step === 1 && (
                            <>
                                {expiredVehicles.length === 0 ? (
                                    <p className="text-muted">No expired discs to renew 🎉</p>
                                ) : (
                                    <div className="row">
                                        {expiredVehicles.map((vehicle, index) => (
                                            <div className="col-md-6 mb-3" key={vehicle.vehicleID}>
                                                <div className="card p-3 shadow-sm">
                                                    <h5>
                                                        {vehicle.vehicleName} ({vehicle.vehicleModel})
                                                    </h5>
                                                    <p>
                                                        Plate: <strong>{vehicle.licensePlate}</strong>
                                                    </p>
                                                    <p>
                                                        Expired on:{" "}
                                                        <span className="text-danger">
                              {new Date(
                                  vehicle.vehicleDisc.expiryDate
                              ).toLocaleDateString()}
                            </span>
                                                    </p>
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleSelectVehicle(index)}
                                                    >
                                                        Continue to Payment
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {step === 2 && selectedVehicleIndex !== null && (
                            <div className="card p-4 shadow-sm">
                                <h4>
                                    Payment for {vehicleList[selectedVehicleIndex].vehicleName}
                                </h4>
                                <p>
                                    License Plate:{" "}
                                    {vehicleList[selectedVehicleIndex].licensePlate}
                                </p>
                                <p>Registration Fee: R {registrationFee}</p>
                                <p>
                                    Current Expiry Date:{" "}
                                    {new Date(
                                        vehicleList[selectedVehicleIndex].vehicleDisc.expiryDate
                                    ).toLocaleDateString()}
                                </p>

                                <div className="mb-3">
                                    <label>Payment Method</label>
                                    <select
                                        className="form-control"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="">Select Payment Method</option>
                                        <option value="Card">Card</option>
                                        <option value="Cash">Cash</option>
                                    </select>
                                </div>

                                {paymentMethod === "Card" && (
                                    <>
                                        <div className="mb-3">
                                            <label>Cardholder Name</label>
                                            <input
                                                type="text"
                                                name="cardholderName"
                                                value={cardDetails.cardholderName}
                                                onChange={handleCardChange}
                                                className="form-control"
                                                placeholder="Full name on card"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label>Card Number</label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={cardDetails.cardNumber}
                                                onChange={handleCardChange}
                                                className="form-control"
                                                placeholder="1234567812345678"
                                            />
                                        </div>
                                        <div className="row">
                                            <div className="col">
                                                <label>Expiry Date (MM/YY)</label>
                                                <input
                                                    type="text"
                                                    name="expiryDate"
                                                    value={cardDetails.expiryDate}
                                                    onChange={handleCardChange}
                                                    className="form-control"
                                                    placeholder="MM/YY"
                                                />
                                            </div>
                                            <div className="col">
                                                <label>CVV</label>
                                                <input
                                                    type="text"
                                                    name="cvv"
                                                    value={cardDetails.cvv}
                                                    onChange={handleCardChange}
                                                    className="form-control"
                                                    placeholder="123"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {error && <p className="text-danger mt-2">{error}</p>}

                                <div className="mt-3">
                                    <button
                                        className="btn btn-success me-2"
                                        onClick={handleRenew}
                                    >
                                        Pay R {registrationFee} & Renew
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setStep(1)}
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    // inside return, when success === true:
                    <div className="text-center p-5">
                        <CheckCircle size={60} color="green"/>
                        <h3 className="mt-3">🎉 Disc Renewed Successfully!</h3>
                        <p>
                            Your vehicle disc is now valid until{" "}
                            {new Date(
                                renewedVehicle?.discExpiryDate ||
                                vehicleList[selectedVehicleIndex]?.vehicleDisc?.expiryDate
                            ).toLocaleDateString()}
                        </p>
                        <button
                            className="btn btn-primary mt-3"
                            onClick={() =>
                                navigate("/vehicle-disc", {
                                    state: {
                                        vehicle:
                                            renewedVehicle || vehicleList[selectedVehicleIndex],
                                        user,
                                        mode: "renewal",
                                    },
                                })
                            }
                        >
                            View Your New Vehicle Disc
                        </button>
                        <div style={{marginTop: "20px", textAlign: "center"}}>
                            <button
                                onClick={() => navigate("/applicant")}
                                style={{
                                    padding: "12px 20px",
                                    borderRadius: "12px",
                                    background: "#10b981",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                Home
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </SharedLayout>
    );
}
