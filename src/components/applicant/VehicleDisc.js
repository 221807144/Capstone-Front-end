import React from "react";
import { CheckCircle, X, Download } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import SharedLayout from "../sharedPages/SharedLayout";

function VehicleDisc() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicle, user } = location.state || {};

  if (!vehicle) return null;

  const discIssueDate = vehicle.discIssueDate
    ? new Date(vehicle.discIssueDate)
    : new Date();

let discExpiryDate;

// If renewal → always issue date + 1 year
if (vehicle.status === "Renewed") {
  discExpiryDate = new Date(discIssueDate);
  discExpiryDate.setFullYear(discIssueDate.getFullYear() + 1);
} else {
  // Registration logic based on vehicle year
  const vehicleYear = Number(vehicle.vehicleYear);
  if (!isNaN(vehicleYear) && vehicleYear > 2024) {
    discExpiryDate = new Date(discIssueDate);
    discExpiryDate.setFullYear(discIssueDate.getFullYear() + 1);
  } else {
    discExpiryDate = new Date(); // same-day expiry for old cars
  }
}

  // Function to download as PDF (using print functionality)
  const downloadAsPDF = () => {
    window.print();
  };

  // Styles
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "500px",
    padding: "24px",
    position: "relative",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  };

  const closeStyle = {
    position: "absolute",
    top: "16px",
    right: "16px",
    cursor: "pointer",
    color: "#6B7280",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "20px",
    fontWeight: 600,
    color: "#047857",
    marginBottom: "16px",
    justifyContent: "center",
  };

  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  };
  const labelStyle = { fontWeight: "600", color: "#374151" };
  const valueStyle = { color: "#111827" };

  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "20px",
  };

  const buttonStyle = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
  };

  return (
    <SharedLayout>
      <div style={overlayStyle}>
        <div style={cardStyle} className="vehicle-disc-card">
          <X
            size={24}
            style={closeStyle}
            onClick={() => navigate(-1)}
            className="no-print"
          />

          <h3 style={headerStyle}>
            <CheckCircle size={24} color="#047857" /> Vehicle Disc
          </h3>

          {user && (
            <p
              style={{
                textAlign: "center",
                marginBottom: "30px",
                fontWeight: "1000",
                color: "#302a2aff",
                fontSize: "20px", 
              }}
            >
              {user.firstName} {user.lastName} <br />
                ID: {user.idNumber}
            </p>
          )}

          <div style={rowStyle}>
            <span style={labelStyle}>Vehicle Name:</span>
            <span style={valueStyle}>{vehicle.vehicleName}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Model:</span>
            <span style={valueStyle}>{vehicle.vehicleModel}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Year:</span>
            <span style={valueStyle}>{vehicle.vehicleYear}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Color:</span>
            <span style={valueStyle}>{vehicle.vehicleColor}</span>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Engine No:</span>
            <span style={valueStyle}>{vehicle.engineNumber}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Chassis No:</span>
            <span style={valueStyle}>{vehicle.chassisNumber}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>License Plate:</span>
            <span style={valueStyle}>{vehicle.licensePlate}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Issue Date:</span>
            <span style={valueStyle}>{discIssueDate.toLocaleDateString()}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Expiry Date:</span>
            <span style={valueStyle}>
              {discExpiryDate.toLocaleDateString()}
            </span>
          </div>

          {vehicle.registrationFee && (
            <div style={rowStyle}>
              <span style={labelStyle}>Registration Fee:</span>
              <span style={valueStyle}>R {vehicle.registrationFee}</span>
            </div>
          )}

          <div style={rowStyle}>
            <span style={labelStyle}>Status:</span>
            <span
              style={{ ...valueStyle, color: "#047857", fontWeight: "600" }}
            >
              {vehicle.status || "Registered"}
            </span>
          </div>

          <div style={buttonContainerStyle} className="no-print">
            <button
              onClick={downloadAsPDF}
              style={{
                ...buttonStyle,
                backgroundColor: "#2563eb",
                color: "white",
              }}
            >
              <Download size={16} /> Download as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Print styles for PDF download */}
      <style>{`
        @media print {
          body, html {
            height: 100%;
            margin: 0;
            padding: 0;
          }
          
          body * {
            visibility: hidden;
            background: transparent !important;
          }
          
          .vehicle-disc-card, .vehicle-disc-card * {
            visibility: visible;
            position: static;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          .vehicle-disc-card {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            position: absolute;
            top: 0;
            left: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          /* Ensure text is black for printing */
          .vehicle-disc-card h3,
          .vehicle-disc-card span {
            color: black !important;
          }
        }
      `}</style>
    </SharedLayout>
  );
}

export default VehicleDisc;
