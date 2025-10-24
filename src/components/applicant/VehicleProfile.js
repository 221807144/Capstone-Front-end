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

  // ✅ ADD DEBUGGING
  useEffect(() => {
    console.log("🔍 VehicleProfile - Full location.state:", location.state);
    console.log("🔍 VehicleProfile - Vehicle object:", initialVehicle);
    console.log("🔍 VehicleProfile - Vehicle properties:", {
      registrationFee: initialVehicle?.registrationFee,
      vehicleDisc: initialVehicle?.vehicleDisc,
      payment: initialVehicle?.payment,
      allKeys: initialVehicle ? Object.keys(initialVehicle) : "No vehicle"
    });
    
    // Deep log vehicleDisc if it exists
    if (initialVehicle?.vehicleDisc) {
      console.log("🔍 VehicleProfile - vehicleDisc object:", initialVehicle.vehicleDisc);
      console.log("🔍 VehicleProfile - vehicleDisc keys:", Object.keys(initialVehicle.vehicleDisc));
    }
    
    console.log("🔍 VehicleProfile - User object:", user);
  }, [location.state, user, initialVehicle]);

  // Vehicle fields
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [status, setStatus] = useState("");
  const [registrationFee, setRegistrationFee] = useState(850); // ✅ CHANGED: Hardcoded to 850
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  
  // FIX: Separate states for image display and file upload
  const [vehicleImage, setVehicleImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const [discIssueDate, setDiscIssueDate] = useState(null);
  const [discExpiryDate, setDiscExpiryDate] = useState(null);
  const [discStatus, setDiscStatus] = useState("N/A");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ✅ REMOVED: The complex getRegistrationFee function since we're hardcoding

  // ✅ IMPROVED: Function to get disc dates from multiple possible locations
  const getDiscDates = (vehicleData) => {
    if (!vehicleData) return { issueDate: null, expiryDate: null };
    
    const issueDate = 
      vehicleData.discIssueDate ? new Date(vehicleData.discIssueDate) :
      (vehicleData.vehicleDisc && vehicleData.vehicleDisc.issueDate) ? new Date(vehicleData.vehicleDisc.issueDate) :
      (vehicleData.issueDate) ? new Date(vehicleData.issueDate) : null;
    
    const expiryDate = 
      vehicleData.discExpiryDate ? new Date(vehicleData.discExpiryDate) :
      (vehicleData.vehicleDisc && vehicleData.vehicleDisc.expiryDate) ? new Date(vehicleData.vehicleDisc.expiryDate) :
      (vehicleData.expiryDate) ? new Date(vehicleData.expiryDate) : null;
    
    return { issueDate, expiryDate };
  };

  useEffect(() => {
    if (!initialVehicle) return;

    console.log("🔄 Initializing vehicle data...");
    
    setVehicle(initialVehicle);
    setVehicleName(initialVehicle.vehicleName || "");
    setVehicleType(initialVehicle.vehicleType || "N/A");
    setVehicleModel(initialVehicle.vehicleModel || "");
    setStatus(initialVehicle.status || "Registered");
    setVehicleColor(initialVehicle.vehicleColor || "");
    setVehicleYear(initialVehicle.vehicleYear || "");
    setEngineNumber(initialVehicle.engineNumber || "");
    setLicensePlate(initialVehicle.licensePlate || "");
    
    // FIX: Set image from vehicle data, not from 'image' property
    setVehicleImage(initialVehicle.vehicleImage || null);

    // ✅ CHANGED: No need to call getRegistrationFee, we're using hardcoded 850

    // ✅ USE IMPROVED DATE FUNCTION
    const { issueDate, expiryDate } = getDiscDates(initialVehicle);
    setDiscIssueDate(issueDate);
    setDiscExpiryDate(expiryDate);
    
    const discStatus = !issueDate || !expiryDate ? "N/A" : new Date() > expiryDate ? "Expired" : "Valid";
    setDiscStatus(discStatus);

    console.log("✅ Vehicle initialization complete:", {
      issueDate,
      expiryDate,
      discStatus
    });
  }, [initialVehicle]);

  // FIX: Proper image upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Store the file for upload
    setSelectedImageFile(file);
    
    // Create preview for immediate display
    const reader = new FileReader();
    reader.onloadend = () => {
      setVehicleImage(reader.result); // This creates a Base64 preview
    };
    reader.readAsDataURL(file);
  };

  // FIX: Proper save handler that uses backend response
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("vehicleID", vehicle.vehicleID);
      formData.append("vehicleType", vehicleType);
      formData.append("vehicleColor", vehicleColor);
      formData.append("vehicleYear", vehicleYear);
      formData.append("engineNumber", engineNumber);
      formData.append("licensePlate", licensePlate);

      // Use the selected file for upload
      if (selectedImageFile) {
        formData.append("image", selectedImageFile);
      }

      console.log("🔄 Sending update request...");
      
      // FIX: Use the response from backend
      const updatedVehicle = await ApiService.updateVehicle(formData);
      
      console.log("✅ Backend response:", updatedVehicle);
      
      // FIX: Update ALL state with the complete vehicle object from backend
      setVehicle(updatedVehicle);
      setVehicleImage(updatedVehicle.vehicleImage); // Use the image from backend
      setSelectedImageFile(null); // Clear the selected file
      
      // ✅ CHANGED: No need to update registration fee, it's hardcoded
      
      setSuccess(true);
      setError("");
      setEditMode(false);
      
    } catch (err) {
      console.error("💥 Update error:", err);
      setError("Failed to update vehicle. Try again.");
      setSuccess(false);
    }
  };

  // FIX: Proper image source function
  const getImageSource = () => {
    if (vehicleImage) {
      return vehicleImage;
    }
    if (vehicle?.vehicleImage) {
      return vehicle.vehicleImage;
    }
    return "/placeholder-car.png";
  };

  if (!vehicle) return <p className="text-center mt-4">No vehicle selected</p>;

  return (
    <SharedLayout>
      <div className="container mt-4">
        <button className="btn btn-secondary mb-3" onClick={() => navigate("/applicant")}>
          &larr; Back
        </button>

        <div className="text-center mb-4">
          <img
            src={getImageSource()}
            alt="Vehicle"
            className="rounded-circle shadow"
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
            onError={(e) => {
              e.target.src = "/placeholder-car.png";
            }}
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
            
            {/* ✅ REGISTRATION FEE - Now hardcoded to 850 */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Registration Fee</label>
              <input 
                type="text" 
                value="R 850" // ✅ CHANGED: Hardcoded value
                className="form-control" 
                disabled 
              />
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
                className={`form-control ${
                  discStatus === 'Valid' ? 'text-success' : 
                  discStatus === 'Expired' ? 'text-danger' : 'text-warning'
                }`} 
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
                {selectedImageFile && (
                  <small className="text-muted">New image selected: {selectedImageFile.name}</small>
                )}
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