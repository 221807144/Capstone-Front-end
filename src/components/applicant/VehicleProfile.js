import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SharedLayout from "../sharedPages/SharedLayout";
import ApiService from "../../services/ApiService";

export default function VehicleProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicle: initialVehicle, user } = location.state || {};

  const [vehicle, setVehicle] = useState(initialVehicle || null);
  const [editMode, setEditMode] = useState(false);

  // Vehicle fields
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleType, setVehicleType] = useState(""); // New field
  const [vehicleModel, setVehicleModel] = useState("");
  const [status, setStatus] = useState("");
  const [registrationFee, setRegistrationFee] = useState(0);

  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleImage, setVehicleImage] = useState(null);

  const [discIssueDate, setDiscIssueDate] = useState(null);
  const [discExpiryDate, setDiscExpiryDate] = useState(null);
  const [discStatus, setDiscStatus] = useState("N/A");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!initialVehicle) return;

    setVehicle(initialVehicle);
    setVehicleName(initialVehicle.vehicleName);
    setVehicleType(initialVehicle.vehicleType || "N/A"); // Initialize vehicle type
    setVehicleModel(initialVehicle.vehicleModel);
    setStatus(initialVehicle.status || "Registered");
    setVehicleColor(initialVehicle.vehicleColor);
    setVehicleYear(initialVehicle.vehicleYear);
    setEngineNumber(initialVehicle.engineNumber);
    setLicensePlate(initialVehicle.licensePlate);
    setVehicleImage(initialVehicle.image || null);

    const fee =
      initialVehicle.registrationFee ||
      (initialVehicle.vehicleDisc && initialVehicle.vehicleDisc.amount) ||
      0;
    setRegistrationFee(fee);

    const disc = initialVehicle.vehicleDisc || {};
    const issueDate =
      initialVehicle.discIssueDate
        ? new Date(initialVehicle.discIssueDate)
        : disc.issueDate
        ? new Date(disc.issueDate)
        : null;
    const expiryDate =
      initialVehicle.discExpiryDate
        ? new Date(initialVehicle.discExpiryDate)
        : disc.expiryDate
        ? new Date(disc.expiryDate)
        : null;

    setDiscIssueDate(issueDate);
    setDiscExpiryDate(expiryDate);

    if (!issueDate || !expiryDate) {
      setDiscStatus("N/A");
    } else {
      const today = new Date();
      setDiscStatus(today > expiryDate ? "Expired" : "Valid");
    }
  }, [initialVehicle]);

  if (!vehicle) return <p className="text-center mt-4">No vehicle selected</p>;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setVehicleImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      const updatedVehicle = {
        vehicleType,
        vehicleColor,
        vehicleYear,
        engineNumber,
        licensePlate,
        image: vehicleImage,
      };

      await ApiService.updateVehicle(vehicle.vehicleID, updatedVehicle);

      setVehicle({ ...vehicle, ...updatedVehicle });
      setSuccess(true);
      setError("");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update vehicle. Try again.");
      setSuccess(false);
    }
  };

  return (
    <SharedLayout>
      <div className="container mt-4">
        <button
          className="btn btn-secondary mb-3"
          onClick={() => navigate("/applicant")}
        >
          &larr; Back
        </button>

        <div className="text-center mb-4">
          <img
            src={vehicleImage || "/placeholder-car.png"}
            alt="Vehicle"
            className="rounded-circle shadow"
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
          />
          <h2 className="mt-3">{vehicleName}</h2>
          <p className="text-muted mb-0">
            Owner: {user?.firstName} {user?.lastName} <br />
            ID: {user?.idNumber}
          </p>
        </div>

        {success && <div className="alert alert-success">Vehicle updated successfully!</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm p-4 rounded-4">
          <div className="d-flex justify-content-between mb-3">
            <h4 className="fw-bold">Vehicle Information</h4>
            <button
              className={`btn ${editMode ? "btn-secondary" : "btn-primary"}`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="row">
            {/* Non-editable fields */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Vehicle Name</label>
              <input type="text" value={vehicleName} className="form-control" disabled />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Vehicle Type</label>
              <input type="text" value={vehicleType} className="form-control" disabled />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Model</label>
              <input type="text" value={vehicleModel} className="form-control" disabled />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Status</label>
              <input type="text" value={status} className="form-control" disabled />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Registration Fee</label>
              <input type="number" value={registrationFee} className="form-control" disabled />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Disc Issue Date</label>
              <input
                type="text"
                value={discIssueDate ? discIssueDate.toLocaleDateString() : "N/A"}
                className="form-control"
                disabled
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Disc Expiry Date</label>
              <input
                type="text"
                value={discExpiryDate ? discExpiryDate.toLocaleDateString() : "N/A"}
                className="form-control"
                disabled
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Disc Status</label>
              <input
                type="text"
                value={discStatus}
                className="form-control"
                disabled
              />
            </div>

            {/* Editable fields */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Color</label>
              <input
                type="text"
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
                className="form-control"
                disabled={!editMode}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Year</label>
              <input
                type="number"
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                className="form-control"
                disabled={!editMode}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Engine Number</label>
              <input
                type="text"
                value={engineNumber}
                onChange={(e) => setEngineNumber(e.target.value)}
                className="form-control"
                disabled={!editMode}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">License Plate</label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="form-control"
                disabled={!editMode}
              />
            </div>

            {editMode && (
              <div className="col-md-12 mb-3">
                <label className="form-label">Vehicle Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="form-control"
                />
              </div>
            )}
          </div>

          {editMode && (
            <button className="btn btn-success mt-3" onClick={handleSave}>
              Save Changes
            </button>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}