// src/components/AdminDashboard.js
import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  FileText,
  ClipboardList,
  Car,
  Eye,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react";
import ApiService from "../../services/ApiService";
import SharedLayout from "../sharedPages/SharedLayout"; // Import SharedLayout

// Custom Rand icon component
const RandIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* R letter */}
    <path d="M7 20V4h6a4 4 0 0 1 0 8H7" />
    <path d="M12 12l4 8" />
    {/* Currency symbol lines */}
    <line x1="4" y1="8" x2="4" y2="8" />
    <line x1="4" y1="12" x2="4" y2="12" />
    <line x1="4" y1="16" x2="4" y2="16" />
  </svg>
);

export default function AdminDashboard() {
  const [data, setData] = useState({
    admins: [],
    applicants: [],
    payments: [],
    testAppointments: [],
    vehicleDiscs: [],
    vehicles: [],
    tickets: [],
    registrations: [],
  });
  const [selectedTab, setSelectedTab] = useState("applicants");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingTest, setEditingTest] = useState(null);
  const [testResultForm, setTestResultForm] = useState({
    testResult: null,
    notes: ""
  });

  // Get admin user data for SharedLayout
  const adminUser = {
    firstName: localStorage.getItem("adminFullName") || "Admin",
    role: "ADMIN"
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const result = await ApiService.getAllData();
      setData({
        admins: result?.admins || [],
        applicants: result?.applicants || [],
        payments: result?.payments || [],
        testAppointments: result?.testAppointments || [],
        vehicleDiscs: result?.vehicleDiscs || [],
        vehicles: result?.vehicles || [],
        tickets: result?.tickets || [],
        registrations: result?.registrations || [],
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
      setLoading(false);
    }
  };

  // Search filter function
  const filterData = (items) => {
    if (!searchTerm) return items || [];
    
    const searchLower = searchTerm.toLowerCase();
    
    return (items || []).filter(item => {
      // Convert all object values to string and search
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        
        if (typeof value === 'object') {
          // Handle nested objects (like contact, address, etc.)
          return Object.values(value).some(nestedValue => 
            nestedValue && nestedValue.toString().toLowerCase().includes(searchLower)
          );
        }
        
        return value.toString().toLowerCase().includes(searchLower);
      });
    });
  };

  // Update applicant status and reason
  const updateApplicantStatus = async (applicantId, status, reason = "") => {
    try {
      await ApiService.updateApplicantStatus(applicantId, {
        status: status,
        reason: reason,
      });
      
      // Update local state
      setData(prev => ({
        ...prev,
        applicants: (prev.applicants || []).map(applicant =>
          applicant.userId === applicantId 
            ? { ...applicant, status, reason }
            : applicant
        )
      }));
      
      alert("Applicant status updated successfully!");
    } catch (err) {
      console.error("Error updating applicant status:", err);
      alert("Failed to update applicant status.");
    }
  };

  // Update test result
  const updateTestResult = async (testAppointmentId, testResult, notes = "") => {
    try {
      await ApiService.updateTestResult(testAppointmentId, {
        testResult: testResult,
        notes: notes,
      });
      
      // Update local state
      setData(prev => ({
        ...prev,
        testAppointments: (prev.testAppointments || []).map(test =>
          test.testAppointmentId === testAppointmentId 
            ? { ...test, testResult, notes }
            : test
        )
      }));
      
      setEditingTest(null);
      setTestResultForm({ testResult: null, notes: "" });
      alert("Test result updated successfully!");
    } catch (err) {
      console.error("Error updating test result:", err);
      alert("Failed to update test result.");
    }
  };

  const handleDelete = async (entity, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setDeletingId(id);
    try {
      switch (entity) {
        case "applicant":
          await ApiService.deleteApplicant(id);
          setData((prev) => ({
            ...prev,
            applicants: (prev.applicants || []).filter((a) => (a.id || a.userId) !== id),
          }));
          break;
        case "payment":
          await ApiService.deletePayment(id);
          setData((prev) => ({
            ...prev,
            payments: (prev.payments || []).filter((p) => p.paymentId !== id),
          }));
          break;
        case "testAppointment":
          await ApiService.deleteTestAppointment(id);
          setData((prev) => ({
            ...prev,
            testAppointments: (prev.testAppointments || []).filter(
              (t) => t.testAppointmentId !== id
            ),
          }));
          break;
        case "vehicleDisc":
          await ApiService.deleteVehicleDisc(id);
          setData((prev) => ({
            ...prev,
            vehicleDiscs: (prev.vehicleDiscs || []).filter((v) => v.vehicleDiscId !== id),
          }));
          break;
        case "vehicle":
          await ApiService.deleteVehicle(id);
          setData((prev) => ({
            ...prev,
            vehicles: (prev.vehicles || []).filter((v) => v.vehicleID !== id),
          }));
          break;
        case "ticket":
          await ApiService.deleteTicket(id);
          setData((prev) => ({
            ...prev,
            tickets: (prev.tickets || []).filter((t) => t.ticketId !== id),
          }));
          break;
        default:
          console.warn("Unknown entity for delete:", entity);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete item. Please try again.");
    }
    setDeletingId(null);
  };

  // Calculate statistics
  const totalRevenue = (data.payments || []).reduce((sum, p) => sum + (p.paymentAmount || 0), 0);
  const completedPaymentsCount = (data.payments || []).filter((p) => 
    p.status === "COMPLETED" || p.status === "SUCCESS" || !p.status
  ).length;
  const pendingTestAppointments = (data.testAppointments || []).filter((t) => 
    t.testResult === null || t.status === "PENDING"
  ).length;

  const stats = [
    { 
      title: "TOTAL APPLICANTS", 
      value: (data.applicants || []).length, 
      icon: Users, 
      color: "bg-primary" 
    },
    {
      title: "TOTAL REVENUE",
      value: `R ${totalRevenue.toLocaleString()}`,
      icon: RandIcon, // Changed from DollarSign to custom RandIcon
      color: "bg-success",
    },
    {
      title: "PENDING TEST APPOINTMENTS",
      value: pendingTestAppointments,
      icon: Calendar,
      color: "bg-warning",
    },
    {
      title: "COMPLETED PAYMENTS",
      value: completedPaymentsCount,
      subtitle: `R ${totalRevenue.toLocaleString()}`,
      icon: FileText,
      color: "bg-info",
    },
    {
      title: "TOTAL TEST APPOINTMENTS",
      value: (data.testAppointments || []).length,
      icon: ClipboardList,
      color: "bg-secondary",
    },
    {
      title: "REGISTERED VEHICLES",
      value: (data.vehicles || []).length,
      icon: Car,
      color: "bg-danger",
    },
  ];

  const filteredApplicants = filterData(data.applicants);
  const filteredVehicles = filterData(data.vehicles);
  const filteredPayments = filterData(data.payments);
  const filteredTestAppointments = filterData(data.testAppointments);
  const filteredVehicleDiscs = filterData(data.vehicleDiscs);
  const filteredTickets = filterData(data.tickets);

  const renderDeleteButton = (entity, id) => (
    <button
      className="btn btn-sm btn-outline-danger"
      onClick={() => handleDelete(entity, id)}
      disabled={deletingId === id}
    >
      {deletingId === id ? "Deleting..." : <Trash2 size={16} />}
    </button>
  );

  // --- Applicants Table ---
  const renderApplicantsTable = () => (
    <div className="table-responsive" style={{ overflowX: "auto" }}>
      <table className="table table-striped table-bordered text-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Contact Number</th>
            <th>Street</th>
            <th>City</th>
            <th>Province</th>
            <th>Country</th>
            <th>Postal Code</th>
            <th>Id NUMBER</th>
            <th>Password</th>
            <th>Status</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplicants.length > 0 ? (
            filteredApplicants.map((a) => (
              <tr key={a.userId}>
                <td>{a.userId}</td>
                <td>{a.firstName}</td>
                <td>{a.lastName}</td>
                <td>{a.contact?.email}</td>
                <td>{a.contact?.cellphone}</td>
                <td>{a.address?.street}</td>
                <td>{a.address?.city}</td>
                <td>{a.address?.province}</td>
                <td>{a.address?.country}</td>
                <td>{a.address?.postalCode || "-"}</td>
                <td>{a.idNumber}</td>
                <td>{"*".repeat(a.password?.length || 0)}</td>
                <td>
                  <select
                    className={`form-select form-select-sm ${
                      a.status === 'ACCEPTED' ? 'bg-success text-white' :
                      a.status === 'REJECTED' ? 'bg-danger text-white' :
                      'bg-warning text-dark'
                    }`}
                    value={a.status || "PENDING"}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      setData((prev) => ({
                        ...prev,
                        applicants: (prev.applicants || []).map((app) =>
                          app.userId === a.userId ? { ...app, status: newStatus } : app
                        ),
                      }));
                      try {
                        const updatedApplicant = (data.applicants || []).find(
                          (app) => app.userId === a.userId
                        );
                        await ApiService.updateApplicantStatus(a.userId, {
                          status: newStatus,
                          reason: updatedApplicant?.reason || "",
                        });
                      } catch (err) {
                        console.error("Error updating status:", err);
                        alert("Failed to update status.");
                      }
                    }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Reason (optional)"
                    value={a.reason || ""}
                    onChange={(e) => {
                      const newReason = e.target.value;
                      setData((prev) => ({
                        ...prev,
                        applicants: (prev.applicants || []).map((app) =>
                          app.userId === a.userId ? { ...app, reason: newReason } : app
                        ),
                      }));
                    }}
                    onBlur={async () => {
                      try {
                        const updatedApplicant = (data.applicants || []).find(
                          (app) => app.userId === a.userId
                        );
                        await ApiService.updateApplicantStatus(a.userId, {
                          status: updatedApplicant?.status || "PENDING",
                          reason: updatedApplicant?.reason || "",
                        });
                      } catch (err) {
                        console.error("Error updating reason:", err);
                      }
                    }}
                  />
                </td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-primary">
                      <Eye size={16} />
                    </button>
                    {renderDeleteButton("applicant", a.userId)}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="15" className="text-center">
                {searchTerm ? "No applicants found matching your search" : "No applicants found."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // --- Test Results Modal ---
  const renderTestResultModal = () => {
    if (!editingTest) return null;

    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update Test Result</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {
                  setEditingTest(null);
                  setTestResultForm({ testResult: null, notes: "" });
                }}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Test Result *</label>
                <div>
                  <button
                    type="button"
                    className={`btn me-2 ${
                      testResultForm.testResult === true 
                        ? 'btn-success' 
                        : 'btn-outline-success'
                    }`}
                    onClick={() => setTestResultForm(prev => ({ ...prev, testResult: true }))}
                  >
                    <CheckCircle size={16} className="me-1" />
                    Pass
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      testResultForm.testResult === false 
                        ? 'btn-danger' 
                        : 'btn-outline-danger'
                    }`}
                    onClick={() => setTestResultForm(prev => ({ ...prev, testResult: false }))}
                  >
                    <XCircle size={16} className="me-1" />
                    Fail
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Add any notes about the test result..."
                  value={testResultForm.notes}
                  onChange={(e) => setTestResultForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setEditingTest(null);
                  setTestResultForm({ testResult: null, notes: "" });
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                disabled={testResultForm.testResult === null}
                onClick={() => updateTestResult(editingTest.testAppointmentId, testResultForm.testResult, testResultForm.notes)}
              >
                Update Result
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Test Appointments Table ---
  const renderTestAppointmentsTable = () => (
    <>
      {renderTestResultModal()}
      <div className="table-responsive" style={{ overflowX: "auto" }}>
        <table className="table table-striped table-bordered text-sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Address</th>
              <th>Venue</th>
              <th>Date</th>
              <th>Time</th>
              <th>Result</th>
              <th>License Code</th>
              <th>Test Type</th>
              <th>Amount</th>
              <th>Payment ID</th>
              <th>Applicant ID</th>
              <th>Applicant Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTestAppointments.length > 0 ? (
              filteredTestAppointments.map((t) => (
                <tr key={t.testAppointmentId}>
                  <td>{t.testAppointmentId}</td>
                  <td>{t.testAddress || "-"}</td>
                  <td>{t.testVenue || "-"}</td>
                  <td>{t.testDate ? new Date(t.testDate).toLocaleDateString() : "-"}</td>
                  <td>{t.testTime || "-"}</td>
                  <td>
                    <span className={`badge ${
                      t.testResult === null 
                        ? 'bg-warning' 
                        : t.testResult 
                          ? 'bg-success' 
                          : 'bg-danger'
                    }`}>
                      {t.testResult === null ? "Pending" : t.testResult ? "Pass" : "Fail"}
                    </span>
                  </td>
                  <td>{t.licenseCode || "-"}</td>
                  <td>{t.testype || "-"}</td>
                  <td>R {t.testAmount?.toFixed(2) || "0.00"}</td>
                  <td>{t.payment ? t.payment.paymentId : "N/A"}</td>
                  <td>{t.applicant ? t.applicant.userId : "N/A"}</td>
                  <td>{t.applicant ? `${t.applicant.firstName || ""} ${t.applicant.lastName || ""}`.trim() : "N/A"}</td>
                  <td>
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          setEditingTest(t);
                          setTestResultForm({
                            testResult: t.testResult,
                            notes: t.notes || ""
                          });
                        }}
                        title="Update Test Result"
                      >
                        <Edit size={16} />
                      </button>
                      {renderDeleteButton("testAppointment", t.testAppointmentId)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="text-center">
                  {searchTerm ? "No test appointments found matching your search" : "No test appointments found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  // --- Vehicles Table ---
  const renderVehiclesTable = () => (
    <div className="table-responsive" style={{ overflowX: "auto" }}>
      <table className="table table-striped table-bordered text-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Model</th>
            <th>Year</th>
            <th>Color</th>
            <th>License Plate</th>
            <th>Engine Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((v) => (
              <tr key={v.vehicleID}>
                <td>{v.vehicleID}</td>
                <td>{v.vehicleName}</td>
                <td>{v.vehicleType}</td>
                <td>{v.vehicleModel}</td>
                <td>{v.vehicleYear}</td>
                <td>{v.vehicleColor}</td>
                <td>{v.licensePlate}</td>
                <td>{v.engineNumber}</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-primary">
                      <Eye size={16} />
                    </button>
                    {renderDeleteButton("vehicle", v.vehicleID)}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center">
                {searchTerm ? "No vehicles found matching your search" : "No vehicles found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // --- Payments Table ---
  const renderPaymentsTable = () => (
    <div className="table-responsive" style={{ overflowX: "auto" }}>
      <table className="table table-striped table-bordered text-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Method</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Cardholder</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.length > 0 ? (
            filteredPayments.map((p) => (
              <tr key={p.paymentId}>
                <td>{p.paymentId}</td>
                <td>{p.paymentType}</td>
                <td>{p.paymentMethod}</td>
                <td>R {p.paymentAmount?.toFixed(2)}</td>
                <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "-"}</td>
                <td>{p.cardholderName || "-"}</td>
                <td>
                  <span className={`badge ${
                    p.status === 'COMPLETED' || p.status === 'SUCCESS' ? 'bg-success' :
                    p.status === 'PENDING' ? 'bg-warning' :
                    p.status === 'FAILED' ? 'bg-danger' : 'bg-secondary'
                  }`}>
                    {p.status || 'COMPLETED'}
                  </span>
                </td>
                <td>{renderDeleteButton("payment", p.paymentId)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                {searchTerm ? "No payments found matching your search" : "No payments found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // --- Vehicle Discs Table ---
  const renderVehicleDiscsTable = () => (
    <div className="table-responsive" style={{ overflowX: "auto" }}>
      <table className="table table-striped table-bordered text-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Disc Number</th>
            <th>Expiry Date</th>
            <th>Vehicle ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVehicleDiscs.length > 0 ? (
            filteredVehicleDiscs.map((vd) => (
              <tr key={vd.vehicleDiscId}>
                <td>{vd.vehicleDiscId}</td>
                <td>{vd.discNumber || "-"}</td>
                <td>{vd.expiryDate ? new Date(vd.expiryDate).toLocaleDateString() : "-"}</td>
                <td>{vd.vehicle?.vehicleID || "-"}</td>
                <td>{renderDeleteButton("vehicleDisc", vd.vehicleDiscId)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                {searchTerm ? "No vehicle discs found matching your search" : "No vehicle discs found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // --- Tickets Table ---
  const renderTicketsTable = () => (
    <div className="table-responsive" style={{ overflowX: "auto" }}>
      <table className="table table-striped table-bordered text-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Issue Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTickets.length > 0 ? (
            filteredTickets.map((t) => (
              <tr key={t.ticketId}>
                <td>{t.ticketId}</td>
                <td>{t.ticketType}</td>
                <td>R {t.ticketAmount?.toFixed(2)}</td>
                <td>{t.issueDate ? new Date(t.issueDate).toLocaleDateString() : "-"}</td>
                <td>{t.status}</td>
                <td>{renderDeleteButton("ticket", t.ticketId)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                {searchTerm ? "No tickets found matching your search" : "No tickets found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderTabContent = () => {
    if (loading) return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading data...</p>
      </div>
    );

    if (error) return (
      <div className="alert alert-danger text-center">
        {error}
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchAllData}>Retry</button>
      </div>
    );

    switch (selectedTab) {
      case "applicants": return renderApplicantsTable();
      case "vehicles": return renderVehiclesTable();
      case "payments": return renderPaymentsTable();
      case "testAppointments": return renderTestAppointmentsTable();
      case "vehicleDiscs": return renderVehicleDiscsTable();
      case "tickets": return renderTicketsTable();
      default: return <div>Select a tab to view data</div>;
    }
  };

  return (
    <SharedLayout user={adminUser}>
      <div className="min-h-screen bg-gradient-to-b from-blue-800 to-green-600 text-gray-900 p-3">
        {/* Search Bar */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="input-group">
              <span className="input-group-text">
                <Search size={20} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search across all data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  Clear
                </button>
              )}
            </div>
            <small className="text-muted">
              Search through {selectedTab} by any field - names, IDs, dates, amounts, etc.
            </small>
          </div>
        </div>

        {/* Stats */}
        <div className="row mb-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="col-md-6 col-lg-4 col-xl-2 mb-3">
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-muted small text-uppercase fw-bold mb-1">{stat.title}</p>
                      <p className="h4 fw-bold text-dark mb-0">{stat.value}</p>
                      {stat.subtitle && (
                        <p className="text-success small fw-bold mb-0">{stat.subtitle}</p>
                      )}
                    </div>
                    <div className={`p-3 rounded ${stat.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <ul className="nav nav-tabs card-header-tabs flex-wrap">
                    {["applicants","vehicles","payments","testAppointments","vehicleDiscs","tickets"].map((tab) => (
                      <li key={tab} className="nav-item">
                        <button className={`nav-link ${selectedTab === tab ? "active" : ""}`} onClick={() => setSelectedTab(tab)}>
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      </li>
                    ))}
                  </ul>
                  {searchTerm && (
                    <span className="badge bg-info">
                      {filterData(data[selectedTab]).length} results
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body">{renderTabContent()}</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">Recent Activity</h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  {(data.applicants || []).slice(0, 5).map((a, i) => (
                    <div key={i} className="list-group-item border-0 px-0">
                      <div className="border-start border-primary ps-3">
                        <h6 className="fw-bold mb-1">New applicant registered</h6>
                        <p className="text-muted small mb-1">{a.firstName} {a.lastName}</p>
                        <small className="text-muted">{new Date().toLocaleDateString()}</small>
                      </div>
                    </div>
                  ))}
                  {(data.testAppointments || []).slice(0, 3).map((t, i) => (
                    <div key={i} className="list-group-item border-0 px-0">
                      <div className="border-start border-success ps-3">
                        <h6 className="fw-bold mb-1">Test appointment created</h6>
                        <p className="text-muted small mb-1">{t.testype || "Test"}</p>
                        <small className="text-muted">{new Date(t.testDate).toLocaleDateString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}