import React, { useState } from "react";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";
import automateLogo from './images/automate-logo.png';
import loginImage from "./images/login-modal.jpg";

const LandingPage = () => {
    const navigate = useNavigate();
    const [showLoginModal, setShowLoginModal] = useState(false);

    const handleLogin = () => {
        navigate("/login");
    }

    const handleSignUp = () => {
        navigate("/register");
    }

    // Scroll to section function
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Handle services click
    const handleServicesClick = () => {
        setShowLoginModal(true);
    };

    const closeModal = () => {
        setShowLoginModal(false);
    };

    const testimonials = [
        {
            name: "SOPHIA R.",
            text: "This platform made my vehicle disc renewal process incredibly smooth and hassle-free. I highly recommend their service!",
            rating: 5,
            date: "Jan 15, 2025",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        },
        {
            name: "MICHAEL T.",
            text: "The ticket payment system saved me so much time. What used to take hours now takes minutes!",
            rating: 4,
            date: "Feb 2, 2025",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        },
        {
            name: "JAMES L.",
            text: "Booking my driver's test was incredibly easy. The whole process was straightforward and efficient.",
            rating: 5,
            date: "Mar 8, 2025",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        },
        {
            name: "LUCY K.",
            text: "I renewed my vehicle registration online—it was quick and convenient. Loved it!",
            rating: 5,
            date: "Apr 21, 2025",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        },
        {
            name: "DANIEL S.",
            text: "This platform simplifies everything related to vehicle services. The UI is great too!",
            rating: 4,
            date: "May 5, 2025",
            image: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        },
        {
            name: "EMMA N.",
            text: "Fantastic service! Booking and paying fines has never been easier.",
            rating: 5,
            date: "Jun 10, 2025",
            image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
        },
    ];

    return (
        <div className="landing-page">
            {/* Login Modal */}
            {showLoginModal && (
                <div className="modal-overlay">
                    <div className="login-modal">
                        <button className="close-modal" onClick={closeModal}>×</button>
                        <div className="modal-content">
                            <img
                                src={loginImage}
                                alt="Login Required"
                                className="modal-image"
                            />
                            <h3>Login Required</h3>
                            <p>Please log in or sign up to access our services</p>
                            <div className="modal-buttons">
                                <button className="modal-login-btn" onClick={handleLogin}>
                                    Login
                                </button>
                                <button className="modal-signup-btn" onClick={handleSignUp}>
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navbar */}
            <nav className="navbar">
                <div className="logo">
                    <img src={automateLogo} alt="Automate"/>
                    <h2>Automate - <br/> Traffic Services</h2>
                </div>
                <ul className="nav-links">
                    <li onClick={() => scrollToSection('home')}>Home</li>
                    <li onClick={() => scrollToSection('about')}>About</li>
                    <li onClick={() => scrollToSection('services')}>Services</li>
                    <li onClick={() => scrollToSection('testimonials')}>Testimonials</li>
                    <li onClick={() => scrollToSection('contact')}>Contact Us</li>
                </ul>
                <div className="auth-buttons">
                    <button className="login-btn" onClick={handleLogin}>Login</button>
                    <button className="signup-btn" onClick={handleSignUp}>Sign Up</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero section">
                <div className="hero-content">
                    <h1>Streamline Your Traffic Services</h1>
                    <p>
                        Your one-stop solution for licensing, fines management, and test bookings.
                        Fast, secure, and convenient services at your fingertips.
                    </p>
                    <button className="cta-btn" onClick={() => scrollToSection('services')}>Explore Services</button>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about section">
                <h2>About Us</h2>
                <div className="about-content">
                    <p>
                        At Traffic Department, we are committed to revolutionizing the way you manage vehicle-related tasks. Our platform is designed to simplify bureaucratic processes, making vehicle registration, license renewals, test bookings, and fine payments seamless and efficient.
                    </p>
                    <p>
                        Established in 2023, our mission is to leverage technology to save you time and reduce the hassle of dealing with traffic-related services. Whether you're booking a learner's or driver's license test, renewing your vehicle disc, or settling traffic fines, our user-friendly interface ensures a stress-free experience.
                    </p>
                    <p>
                        We prioritize security, transparency, and customer satisfaction, offering real-time updates, secure payment gateways, and 24/7 customer support. Our goal is to empower users with a reliable, all-in-one platform that caters to all their vehicular administrative needs.
                    </p>
                    <div className="about-stats">
                        <div className="stat">
                            <h3>50K+</h3>
                            <p>Users Served</p>
                        </div>
                        <div className="stat">
                            <h3>10K+</h3>
                            <p>Bookings Completed</p>
                        </div>
                        <div className="stat">
                            <h3>99%</h3>
                            <p>Customer Satisfaction</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id ="services" className="services section">
                <h2>Our Services</h2>
                <div className="service-grid">
                    <div className="card learners-test" onClick={handleServicesClick}>
                        <h3>Book Learners Test</h3>
                        <p>Schedule your learner's license test with ease.</p>
                    </div>
                    <div className="card drivers-test" onClick={handleServicesClick}>
                        <h3>Book Drivers Test</h3>
                        <p>Book your driver's license test in just a few clicks.</p>
                    </div>
                    <div className="card register-vehicle" onClick={handleServicesClick}>
                        <h3>Register Vehicle</h3>
                        <p>Register your vehicle and receive your disc promptly.</p>
                    </div>
                    <div className="card renew-disc" onClick={handleServicesClick}>
                        <h3>Renew Vehicle Disc</h3>
                        <p>Renew your vehicle disc online, hassle-free.</p>
                    </div>
                    <div className="card pay-ticket" onClick={handleServicesClick}>
                        <h3>Pay Traffic Ticket</h3>
                        <p>Pay outstanding traffic fines quickly and securely.</p>
                    </div>
                    <div className="card payment-history" onClick={handleServicesClick}>
                        <h3>Payments History</h3>
                        <p>Track all your payments in one place.</p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id ="testimonials" className="testimonials section">
                <h2>Testimonials</h2>
                <div className="testimonial-grid">
                    {testimonials.map((t, index) => (
                        <div className="testimonial" key={index}>
                            <div className="testimonial-header">
                                <img
                                    src={t.image}
                                    alt={`${t.name} profile`}
                                    className="testimonial-image"
                                />
                                <div className="testimonial-info">
                                    <h4>{t.name}</h4>
                                    <div className="stars">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <i key={i} className="fas fa-star"></i>
                                        ))}
                                        {[...Array(5 - t.rating)].map((_, i) => (
                                            <i key={i} className="far fa-star"></i>
                                        ))}
                                        <span className="date">{t.date}</span>
                                    </div>
                                </div>
                            </div>
                            <p>"{t.text}"</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Us Section */}
            <section id="contact" className="contact section">
                <h2>Contact Us</h2>
                <div className="contact-content">
                    <div className="contact-info">
                        <h3>Get in Touch</h3>
                        <p><strong>Email:</strong> support@trafficdepartment.com</p>
                        <p><strong>Phone:</strong> +1 (800) 123-4567</p>
                        <p><strong>Address:</strong> 123 Traffic Way, Cityville, ST 12345</p>
                        <p><strong>Hours:</strong> Mon-Fri, 9 AM - 5 PM</p>
                        <div className="social-links">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                        </div>
                    </div>
                    <div className="contact-map">
                        <div className="map-placeholder">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.7123002046696!2d18.621921976454963!3d-34.05125037315747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1dcc48a3f6eaf125%3A0xfbc9d92aa25d5ed8!2sMitchell&#39;s%20Plain%20Traffic%20Department!5e0!3m2!1sen!2suk!4v1761493221847!5m2!1sen!2suk"
                                allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer>
                <div className="footer-sections">
                    <div>
                        <h4>Services</h4>
                        <p onClick={handleServicesClick}>Learner's Test</p>
                        <p onClick={handleServicesClick}>Driver's Test</p>
                        <p onClick={handleServicesClick}>Vehicle Registration</p>
                        <p onClick={handleServicesClick}>Vehicle Disc Renewal</p>
                        <p onClick={handleServicesClick}>Traffic Ticket Management</p>
                        <p onClick={handleServicesClick}>Track Payments</p>
                    </div>
                    <div>
                        <h4>Company</h4>
                        <p onClick={() => scrollToSection('about')}>About Us</p>
                        <p onClick={() => scrollToSection('contact')}>Contact</p>
                        <p>Locations</p>
                    </div>
                    <div>
                        <h4>Resources</h4>
                        <p>Help Center</p>
                        <p>FAQ</p>
                        <p>Requirements</p>
                    </div>
                    <div>
                        <h4>Connect</h4>
                        <p>Twitter</p>
                        <p>Facebook</p>
                        <p>Instagram</p>
                    </div>
                </div>
                <p className="footer-note">
                    © 2025 Traffic Department. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;