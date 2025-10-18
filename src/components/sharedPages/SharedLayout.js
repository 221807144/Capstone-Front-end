import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../images/image.png";

const SharedLayout = ({ children, user }) => {
  const [showBookingDropdown, setShowBookingDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  // 🛠️ WORKING LOGOUT FUNCTION
  const handleLogout = () => {
    console.log('🔄 Logging out...');
    
    // Clear ALL authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('userData');
    
    console.log('✅ After logout - Token:', localStorage.getItem('token'));
    console.log('✅ After logout - User:', localStorage.getItem('user'));
    
    // Redirect to login page with page reload to clear React state
    window.location.href = '/login';
  };

  return (
    <div style={styles.layout}>
      {/* Header with Logo */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoContainer}>
            {/* Logo Image with Text */}
            <img
              src={logo}
              alt="Traffic Department Logo"
              style={styles.logoImage}
            />
            <div style={styles.logoTextContainer}>
              <h1 style={styles.departmentText}>TRAFFIC DEPARTMENT</h1>
              <p style={styles.taglineText}>Vehicle Services & Licensing</p>
            </div>
          </div>

          <nav style={styles.nav}>
            {/* Home Link */}
            <div style={styles.navItem}>
              <Link to="/Home" style={styles.navLink}>
                Home
              </Link>
            </div>

            {/* About Link */}
            <div style={styles.navItem}>
              <Link to="/about" style={styles.navLink}>
                About
              </Link>
            </div>

            {/* Booking Dropdown */}
            <div
              style={styles.navItem}
              onMouseEnter={() => setShowBookingDropdown(true)}
              onMouseLeave={() => setShowBookingDropdown(false)}
            >
              <div style={styles.navLink}>Booking</div>
              {showBookingDropdown && (
                <div style={styles.dropdownMenu}>
                  <Link to="/booking/learners-test" style={styles.dropdownItem}>
                    Learners Test
                  </Link>
                  <Link to="/booking/drivers-test" style={styles.dropdownItem}>
                    Drivers Test
                  </Link>
                </div>
              )}
            </div>

            {/* Services Link */}
            <div style={styles.navItem}>
              <Link to="/services" style={styles.navLink}>
                Services
              </Link>
            </div>

            {/* Profile Dropdown with User Name */}
            <div
              style={styles.navItem}
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <div style={styles.navLink}>Profile</div>
              {showProfileDropdown && (
                <div style={styles.dropdownMenu}>
                  <Link to="/profile" style={styles.dropdownItem}>
                    My Information
                  </Link>
                  <Link to="/profile/tickets" style={styles.dropdownItem}>
                    Tickets
                  </Link>
                  <Link to="/profile/payments" style={styles.dropdownItem}>
                    Payments
                  </Link>
                  {/* 🛠️ FIXED: Logout button with actual logout function */}
                  <button 
                    onClick={handleLogout}
                    style={styles.logoutButton}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
            {user && user.firstName && (
              <span style={styles.userName}> {user.firstName}</span>
            )}
          </nav>

          <div style={styles.headerActions}>
            {/* 🛠️ FIXED: Logout button with actual logout function */}
            <button 
              onClick={handleLogout}
              style={styles.primaryButton}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>{children}</main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerHeading}>Services</h3>
            <Link to="/booking/learners-test" style={styles.footerLink}>
              Learners Test
            </Link>
            <Link to="/booking/drivers-test" style={styles.footerLink}>
              Drivers Test
            </Link>
            <Link to="/vehicle-registration" style={styles.footerLink}>
              Vehicle Registration
            </Link>
          </div>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerHeading}>Company</h3>
            <Link to="/about" style={styles.footerLink}>
              About Us
            </Link>
            <Link to="/contact" style={styles.footerLink}>
              Contact
            </Link>
            <Link to="/locations" style={styles.footerLink}>
              Locations
            </Link>
          </div>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerHeading}>Resources</h3>
            <Link to="/help" style={styles.footerLink}>
              Help Center
            </Link>
            <Link to="/faq" style={styles.footerLink}>
              FAQ
            </Link>
            <Link to="/requirements" style={styles.footerLink}>
              Requirements
            </Link>
          </div>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerHeading}>Connect</h3>
            <div style={styles.socialLinks}>
              <a href="#" style={styles.socialLink}>
                Twitter
              </a>
              <a href="#" style={styles.socialLink}>
                Facebook
              </a>
              <a href="#" style={styles.socialLink}>
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} Traffic Department. All rights
            reserved.
          </p>
          <div style={styles.legalLinks}>
            <Link to="/privacy" style={styles.legalLink}>
              Privacy Policy
            </Link>
            <Link to="/terms" style={styles.legalLink}>
              Terms of Service
            </Link>
            <Link to="/accessibility" style={styles.legalLink}>
              Accessibility
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  layout: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    backgroundColor: "#1a3a5f",
    color: "white",
    padding: "0.5rem 0",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    borderBottom: "3px solid #ffc107",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1rem",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    flex: "1",
  },
  logoImage: {
    height: "50px",
    marginRight: "15px",
  },
  logoTextContainer: {
    display: "flex",
    flexDirection: "column",
  },
  departmentText: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: "0",
    color: "white",
    letterSpacing: "1px",
  },
  taglineText: {
    fontSize: "0.8rem",
    margin: "0",
    color: "#cce0ff",
    fontStyle: "italic",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    flex: "2",
    justifyContent: "center",
  },
  navItem: {
    position: "relative",
    margin: "0 15px",
  },
  userName: {
    fontWeight: "500",
    color: "#ffc107",
    fontSize: "14px",
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    fontWeight: "500",
    padding: "10px 15px",
    borderRadius: "4px",
    transition: "background-color 0.3s",
    cursor: "pointer",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: "0",
    backgroundColor: "white",
    minWidth: "160px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    borderRadius: "4px",
    zIndex: "1000",
    padding: "10px 0",
  },
  dropdownItem: {
    display: "block",
    padding: "10px 20px",
    color: "#333",
    textDecoration: "none",
    transition: "background-color 0.2s",
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left",
    font: "inherit",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f5f5f5",
    }
  },
  // 🛠️ NEW: Logout button style for dropdown
  logoutButton: {
    display: "block",
    padding: "10px 20px",
    color: "#333",
    textDecoration: "none",
    transition: "background-color 0.2s",
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left",
    font: "inherit",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f5f5f5",
    }
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    flex: "1",
    justifyContent: "flex-end",
  },
  primaryButton: {
    backgroundColor: "#ffc107",
    color: "#1a3a5f",
    padding: "8px 20px",
    borderRadius: "4px",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "background-color 0.3s",
    border: "none",
    cursor: "pointer",
    font: "inherit",
    "&:hover": {
      backgroundColor: "#e0a800",
    }
  },
  main: {
    flex: "1",
    padding: "20px 0",
  },
  footer: {
    backgroundColor: "#f3f4f6",
    padding: "40px 0 20px",
    marginTop: "auto",
  },
  footerContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  footerColumn: {
    display: "flex",
    flexDirection: "column",
  },
  footerHeading: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a3a5f",
    margin: "0 0 15px 0",
  },
  footerLink: {
    textDecoration: "none",
    color: "#4b5563",
    fontSize: "14px",
    marginBottom: "8px",
    transition: "color 0.2s",
  },
  socialLinks: {
    display: "flex",
    flexDirection: "column",
  },
  socialLink: {
    textDecoration: "none",
    color: "#4b5563",
    fontSize: "14px",
    marginBottom: "8px",
    transition: "color 0.2s",
  },
  footerBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "30px auto 0",
    padding: "20px 20px 0",
    borderTop: "1px solid #d1d5db",
  },
  copyright: {
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
  },
  legalLinks: {
    display: "flex",
    gap: "20px",
  },
  legalLink: {
    textDecoration: "none",
    color: "#6b7280",
    fontSize: "14px",
    transition: "color 0.2s",
  },
};

export default SharedLayout;