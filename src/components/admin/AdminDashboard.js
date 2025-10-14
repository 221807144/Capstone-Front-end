// src/components/AdminDashboard.js
import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  Calendar,
  FileText,
  ClipboardList,
  Ticket,
  Eye,
  Trash2,
  LogOut,
  Search,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react";
import ApiService from "../../services/ApiService";

export default function AdminDashboard() {
  const [data, setData] = useState({
    admins: [],
    applicants: [],
    bookings: [],
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

  const adminFullName = localStorage.getItem("adminFullName") || "Admin";

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
        bookings: result?.bookings || [],
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
        case "booking":
          await ApiService.deleteBooking(id);
          setData((prev) => ({
            ...prev,
            bookings: (prev.bookings || []).filter((b) => b.bookingId !== id),
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

  const stats = [
    { title: "TOTAL APPLICANTS", value: (data.applicants || []).length, icon: Users, color: "bg-primary" },
    {
      title: "TOTAL REVENUE",
      value: `R ${(data.payments || []).reduce((sum, p) => sum + (p.paymentAmount || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-success",
    },
    {
      title: "PENDING BOOKINGS",
      value: (data.bookings || []).filter((b) => b.status === "PENDING").length,
      icon: Calendar,
      color: "bg-warning",
    },
    {
      title: "COMPLETED PAYMENTS",
      value: (data.payments || []).filter((p) => p.status === "COMPLETED").length,
      icon: FileText,
      color: "bg-info",
    },
    {
      title: "TEST APPOINTMENTS",
      value: (data.testAppointments || []).length,
      icon: ClipboardList,
      color: "bg-secondary",
    },
    {
      title: "ACTIVE TICKETS",
      value: (data.tickets || []).filter((t) => t.status === "ACTIVE").length,
      icon: Ticket,
      color: "bg-danger",
    },
  ];

  const filteredApplicants = filterData(data.applicants);
  const filteredVehicles = filterData(data.vehicles);
  const filteredPayments = filterData(data.payments);
  const filteredBookings = filterData(data.bookings);
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
                <td>{renderDeleteButton("payment", p.paymentId)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                {searchTerm ? "No payments found matching your search" : "No payments found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // --- Bookings Table ---
  const renderBookingsTable = () => (
    <div className="table-responsive" style={{ overflowX: "auto" }}>
      <table className="table table-striped table-bordered text-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.length > 0 ? (
            filteredBookings.map((b) => (
              <tr key={b.bookingId}>
                <td>{b.bookingId}</td>
                <td>{b.booktype || "-"}</td>
                <td>{b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : "-"}</td>
                <td>{b.status || "-"}</td>
                <td>{renderDeleteButton("booking", b.bookingId)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                {searchTerm ? "No bookings found matching your search" : "No bookings found"}
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
      case "bookings": return renderBookingsTable();
      case "payments": return renderPaymentsTable();
      case "testAppointments": return renderTestAppointmentsTable();
      case "vehicleDiscs": return renderVehicleDiscsTable();
      case "tickets": return renderTicketsTable();
      default: return <div>Select a tab to view data</div>;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminFullName");
    localStorage.removeItem("adminId");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-green-600 text-gray-900 p-3">
      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center p-2 mb-3 rounded" style={{ background: "linear-gradient(to right, #002395, #ffb612, #007847)" }}>
        <h4 className="text-white mb-0">{adminFullName}</h4>
        <button className="btn btn-light btn-sm d-flex align-items-center" onClick={handleLogout}>
          <LogOut className="h-4 w-4 me-1" /> Logout
        </button>
      </div>

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
                  {["applicants","vehicles","bookings","payments","testAppointments","vehicleDiscs","tickets"].map((tab) => (
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
  );
}