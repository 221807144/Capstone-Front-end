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
    PlusCircle,
    Bell,
    Cog,
    LogOut,
    Home,
    User,
    BarChart3
} from "lucide-react";
import ApiService from "../../services/ApiService";
import "./AdminDashboard.css";
import logo from "../images/logo2.png";
import { useNavigate } from "react-router-dom";

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
        <path d="M7 20V4h6a4 4 0 0 1 0 8H7" />
        <path d="M12 12l4 8" />
        <line x1="4" y1="8" x2="4" y2="8" />
        <line x1="4" y1="12" x2="4" y2="12" />
        <line x1="4" y1="16" x2="4" y2="16" />
    </svg>
);

export default function AdminDashboard() {
    const navigate = useNavigate();
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
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [ticketForm, setTicketForm] = useState({
        vehicleId: "",
        ticketType: "",
        status: "PENDING",
        issueDate: new Date().toISOString().split('T')[0]
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Get admin user data
    const adminUser = {
        firstName: localStorage.getItem("adminFullName") || "Admin",
        lastName: "",
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

    const createTicket = async () => {
        try {
            const ticketData = {
                vehicle: { vehicleID: parseInt(ticketForm.vehicleId) },
                ticketType: ticketForm.ticketType,
                status: ticketForm.status,
                issueDate: ticketForm.issueDate,
                ticketAmount: getTicketAmount(ticketForm.ticketType)
            };

            await ApiService.createTicket(ticketData);
            await fetchAllData();

            setShowTicketModal(false);
            setTicketForm({
                vehicleId: "",
                ticketType: "",
                status: "UNPAID",
                issueDate: new Date().toISOString().split('T')[0]
            });
            alert("Ticket created successfully!");
        } catch (err) {
            console.error("Error creating ticket:", err);
            alert("Failed to create ticket. Please try again.");
        }
    };

    const getTicketAmount = (ticketType) => {
        const ticketTypes = {
            SPEEDING_1_10_KMH: 500,
            SPEEDING_30_PLUS_KMH: 2500,
            DRUNK_DRIVING: 2000,
            RED_LIGHT: 1500,
            NO_LICENSE: 1500,
            PHONE_WHILE_DRIVING: 1500,
            NO_SEATBELT: 500,
            RECKLESS_DRIVING: 2500
        };
        return ticketTypes[ticketType] || 0;
    };

    const filterData = (items) => {
        if (!searchTerm) return items || [];
        const searchLower = searchTerm.toLowerCase();
        return (items || []).filter(item => {
            return Object.values(item).some(value => {
                if (value === null || value === undefined) return false;
                if (typeof value === 'object') {
                    return Object.values(value).some(nestedValue =>
                        nestedValue && nestedValue.toString().toLowerCase().includes(searchLower)
                    );
                }
                return value.toString().toLowerCase().includes(searchLower);
            });
        });
    };

    const updateTestResult = async (testAppointmentId, testResult, notes = "") => {
        try {
            await ApiService.updateTestResult(testAppointmentId, {
                testResult: testResult,
                notes: notes,
            });

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

    const handleLogout = () => {
        console.log('🔄 Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('userData');
        localStorage.removeItem('adminFullName');
        window.location.href = '/login';
    };

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
            color: "#057dcd"
        },
        {
            title: "TOTAL REVENUE",
            value: `R ${totalRevenue.toLocaleString()}`,
            icon: RandIcon,
            color: "#28a745",
        },
        {
            title: "PENDING TEST APPOINTMENTS",
            value: pendingTestAppointments,
            icon: Calendar,
            color: "#ffc107",
        },
        {
            title: "COMPLETED PAYMENTS",
            value: completedPaymentsCount,
            icon: FileText,
            color: "#6f42c1",
        },
        {
            title: "TOTAL TEST APPOINTMENTS",
            value: (data.testAppointments || []).length,
            icon: ClipboardList,
            color: "#20c997",
        },
        {
            title: "REGISTERED VEHICLES",
            value: (data.vehicles || []).length,
            icon: Car,
            color: "#dc3545",
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
            className="btn-sm btn-danger"
            onClick={() => handleDelete(entity, id)}
            disabled={deletingId === id}
        >
            {deletingId === id ? "Deleting..." : <Trash2 size={16} />}
        </button>
    );

    const renderApplicantsTable = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Contact Number</th>
                    <th>ID Number</th>
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
                            <td>{a.idNumber}</td>
                            <td>
                                <select
                                    className={`status-select ${
                                        a.status === 'ACCEPTED' ? 'status-accepted' :
                                            a.status === 'REJECTED' ? 'status-rejected' :
                                                'status-pending'
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
                                    className="form-input-sm"
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
                                <div className="action-buttons">
                                    <button className="btn-sm btn-primary">
                                        <Eye size={16} />
                                    </button>
                                    {renderDeleteButton("applicant", a.userId)}
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="9" className="no-data">
                            {searchTerm ? "No applicants found matching your search" : "No applicants found."}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );

    const renderTestResultModal = () => {
        if (!editingTest) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Update Test Result</h5>
                        <button
                            type="button"
                            className="close-btn"
                            onClick={() => {
                                setEditingTest(null);
                                setTestResultForm({ testResult: null, notes: "" });
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Test Result *</label>
                            <div className="result-buttons">
                                <button
                                    type="button"
                                    className={`btn-result ${testResultForm.testResult === true ? 'result-pass' : 'result-outline'}`}
                                    onClick={() => setTestResultForm(prev => ({ ...prev, testResult: true }))}
                                >
                                    <CheckCircle size={16} className="me-1" />
                                    Pass
                                </button>
                                <button
                                    type="button"
                                    className={`btn-result ${testResultForm.testResult === false ? 'result-fail' : 'result-outline'}`}
                                    onClick={() => setTestResultForm(prev => ({ ...prev, testResult: false }))}
                                >
                                    <XCircle size={16} className="me-1" />
                                    Fail
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notes (Optional)</label>
                            <textarea
                                className="form-input"
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
                            className="btn-secondary"
                            onClick={() => {
                                setEditingTest(null);
                                setTestResultForm({ testResult: null, notes: "" });
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn-primary"
                            disabled={testResultForm.testResult === null}
                            onClick={() => updateTestResult(editingTest.testAppointmentId, testResultForm.testResult, testResultForm.notes)}
                        >
                            Update Result
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderTicketModal = () => {
        if (!showTicketModal) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Create New Ticket</h5>
                        <button
                            type="button"
                            className="close-btn"
                            onClick={() => {
                                setShowTicketModal(false);
                                setTicketForm({
                                    vehicleId: "",
                                    ticketType: "",
                                    status: "UNPAID",
                                    issueDate: new Date().toISOString().split('T')[0]
                                });
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Vehicle *</label>
                            <select
                                className="form-input"
                                value={ticketForm.vehicleId}
                                onChange={(e) => setTicketForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                                required
                            >
                                <option value="">Select a vehicle</option>
                                {(data.vehicles || []).map((vehicle) => (
                                    <option key={vehicle.vehicleID} value={vehicle.vehicleID}>
                                        {vehicle.vehicleName} ({vehicle.licensePlate})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Ticket Type *</label>
                            <select
                                className="form-input"
                                value={ticketForm.ticketType}
                                onChange={(e) => setTicketForm(prev => ({ ...prev, ticketType: e.target.value }))}
                                required
                            >
                                <option value="">Select ticket type</option>
                                {[
                                    "SPEEDING_1_10_KMH",
                                    "SPEEDING_30_PLUS_KMH",
                                    "DRUNK_DRIVING",
                                    "RED_LIGHT",
                                    "NO_LICENSE",
                                    "PHONE_WHILE_DRIVING",
                                    "NO_SEATBELT",
                                    "RECKLESS_DRIVING"
                                ].map((type) => (
                                    <option key={type} value={type}>
                                        {type.replace(/_/g, ' ')} (R {getTicketAmount(type).toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-input"
                                value="UNPAID"
                                disabled
                            >
                                <option value="UNPAID">Unpaid</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Issue Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={new Date().toISOString().split("T")[0]}
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                                setShowTicketModal(false);
                                setTicketForm({
                                    vehicleId: "",
                                    ticketType: "",
                                    status: "PENDING",
                                    issueDate: new Date().toISOString().split('T')[0]
                                });
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn-primary"
                            disabled={!ticketForm.vehicleId || !ticketForm.ticketType}
                            onClick={createTicket}
                        >
                            Create Ticket
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderTestAppointmentsTable = () => (
        <>
            {renderTestResultModal()}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Address</th>
                        <th>Venue</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Result</th>
                        <th>Test Type</th>
                        <th>Amount</th>
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
                                    <span className={`status-badge ${
                                        t.testResult === null
                                            ? 'status-pending'
                                            : t.testResult
                                                ? 'status-accepted'
                                                : 'status-rejected'
                                    }`}>
                                        {t.testResult === null ? "Pending" : t.testResult ? "Pass" : "Fail"}
                                    </span>
                                </td>
                                <td>{t.testype || "-"}</td>
                                <td>R {t.testAmount?.toFixed(2) || "0.00"}</td>
                                <td>{t.applicant ? `${t.applicant.firstName || ""} ${t.applicant.lastName || ""}`.trim() : "N/A"}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-sm btn-primary"
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
                            <td colSpan="10" className="no-data">
                                {searchTerm ? "No test appointments found matching your search" : "No test appointments found."}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderVehiclesTable = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Model</th>
                    <th>Year</th>
                    <th>License Plate</th>
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
                            <td>{v.licensePlate}</td>
                            <td>
                                <div className="action-buttons">
                                    <button className="btn-sm btn-primary">
                                        <Eye size={16} />
                                    </button>
                                    {renderDeleteButton("vehicle", v.vehicleID)}
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="7" className="no-data">
                            {searchTerm ? "No vehicles found matching your search" : "No vehicles found"}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );

    const renderPaymentsTable = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
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
                            <td>
                                <span className={`status-badge ${
                                    p.status === 'COMPLETED' || p.status === 'SUCCESS' ? 'status-accepted' :
                                        p.status === 'PENDING' ? 'status-pending' :
                                            p.status === 'FAILED' ? 'status-rejected' : 'status-pending'
                                }`}>
                                    {p.status || 'COMPLETED'}
                                </span>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="no-data">
                            {searchTerm ? "No payments found matching your search" : "No payments found"}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );

    const renderVehicleDiscsTable = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
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
                        <td colSpan="5" className="no-data">
                            {searchTerm ? "No vehicle discs found matching your search" : "No vehicle discs found"}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );

    const renderTicketsTable = () => (
        <div className="table-container">
            <div className="table-header-actions">
                <button
                    className="btn-primary"
                    onClick={() => setShowTicketModal(true)}
                >
                    <PlusCircle size={16} className="me-2" />
                    Add Ticket
                </button>
            </div>
            {renderTicketModal()}
            <table className="data-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Issue Date</th>
                    <th>Status</th>
                    <th>Vehicle</th>
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
                            <td>
                                <span className={`status-badge ${
                                    t.status === 'PAID' ? 'status-accepted' : 'status-pending'
                                }`}>
                                    {t.status}
                                </span>
                            </td>
                            <td>{t.vehicle ? `${t.vehicle.vehicleName} (${t.vehicle.licensePlate})` : "-"}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="no-data">
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
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading data...</p>
            </div>
        );

        if (error) return (
            <div className="error-state">
                {error}
                <button className="btn-primary ms-3" onClick={fetchAllData}>Retry</button>
            </div>
        );

        switch (selectedTab) {
            case "applicants":
                return renderApplicantsTable();
            case "vehicles":
                return renderVehiclesTable();
            case "payments":
                return renderPaymentsTable();
            case "testAppointments":
                return renderTestAppointmentsTable();
            case "vehicleDiscs":
                return renderVehicleDiscsTable();
            case "tickets":
                return renderTicketsTable();
            default:
                return <div>Select a tab to view data</div>;
        }
    };

    const tabs = [
        { key: "applicants", label: "Applicants", icon: Users },
        { key: "vehicles", label: "Vehicles", icon: Car },
        { key: "payments", label: "Payments", icon: FileText },
        { key: "testAppointments", label: "Test Appointments", icon: Calendar },
        { key: "vehicleDiscs", label: "Vehicle Discs", icon: ClipboardList },
        { key: "tickets", label: "Tickets", icon: BarChart3 }
    ];

    return (
        <div className="dashboard-container">
            {/* Main Content */}
            <div className="main-content">
                {/* Top Header */}
                <header className="dashboard-header">
                    <div className="header-left">
                        <img src={logo} alt="AutoMate Logo" />
                        <h2>AutoMate <br />Traffic Services</h2>
                    </div>

                    <div className="header-right">
                        <div className="user-profile">
                            <div className="user-avatar">
                                {adminUser.firstName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <span className="user-name">{adminUser.firstName} {adminUser.lastName}</span>
                                <span className="user-role">Administrator</span>
                            </div>
                            <button onClick={() => navigate("/login")}>Log Out</button>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    {/* Welcome Section */}
                    <section className="welcome-section2">
                        <div className="welcome-card2">
                            <div className="welcome-content">
                                <h2>Welcome back, {adminUser.firstName}!</h2>
                                <p>Manage your traffic department operations and monitor system activity</p>
                                <div className="welcome-stats">
                                    {stats.map((stat, index) => (
                                        <div key={index} className="stat-item">
                                            <span className="stat-number">{stat.value}</span>
                                            <span className="stat-label">{stat.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Search Section */}
                    <section className="search-section">
                        <div className="search-card">
                            <div className="search-input-group">
                                <Search size={20} className="search-icon" />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search across all data..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        className="btn-outline"
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className="search-info">
                                Search through {selectedTab} by any field - names, IDs, dates, amounts, etc.
                                {searchTerm && (
                                    <span className="search-results">
                                        {filterData(data[selectedTab]).length} results found
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Main Content Grid */}
                    <div className="content-grid2">
                        {/* Data Tables Section */}
                        <section className="data-section">
                            <div className="section-header">
                                <h3>Management Dashboard</h3>
                            </div>

                            <div className="tabs-container">
                                <div className="tabs-header">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.key}
                                                className={`tab-button ${selectedTab === tab.key ? 'active' : ''}`}
                                                onClick={() => setSelectedTab(tab.key)}
                                            >
                                                <Icon size={16} className="tab-icon" />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="tab-content">
                                    {renderTabContent()}
                                </div>
                            </div>
                        </section>

                        {/* Recent Activity */}
                        <section className="activity-section">
                            <div className="section-header">
                                <h3>Recent Activity</h3>
                            </div>
                            <div className="activity-list">
                                {(data.applicants || []).slice(0, 5).map((a, i) => (
                                    <div key={i} className="activity-item">
                                        <div className="activity-icon">
                                            <Users size={16} />
                                        </div>
                                        <div className="activity-content">
                                            <h5>New applicant registered</h5>
                                            <p>{a.firstName} {a.lastName}</p>
                                            <span className="activity-time">{new Date().toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {(data.testAppointments || []).slice(0, 3).map((t, i) => (
                                    <div key={i} className="activity-item">
                                        <div className="activity-icon">
                                            <Calendar size={16} />
                                        </div>
                                        <div className="activity-content">
                                            <h5>Test appointment created</h5>
                                            <p>{t.testype || "Test"}</p>
                                            <span className="activity-time">
                                                {new Date(t.testDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}