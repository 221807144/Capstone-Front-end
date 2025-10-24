import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import SharedLayout from "../sharedPages/SharedLayout";
import ApiService from "../../services/ApiService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faCar, faTimes } from '@fortawesome/free-solid-svg-icons';

// Import your service images
import learnersTestImg from "../images/car1.jpeg";
import driversTestImg from "../images/car2.jpg";
import registerVehicleImg from "../images/car3.jpg";
import payTicketImg from "../images/car5.jpg";
import disc from "../images/disc.jpg";
import learners from "../images/learners.jpg";

// Traffic Department responses for South Africa
const trafficResponses = {
  "learners license": "To get a learner's license: You must be 17+ years old, complete LL1 form, provide ID, 2 ID photos, proof of address, and pay R108 fee. Study the K53 manual.",
  "drivers license": "For a driver's license: Need valid learner's license, complete DL1 form, pass eye test, provide ID, photos, proof of address. Fees: R228 for test, R140 for card.",
  "renew license": "License renewal: Must be done 4 weeks before expiry at DLTC. Bring ID, current license, proof of address, eye test certificate. Fee: R228.",
  "register vehicle": "Vehicle registration requires: Original title deed, roadworthy certificate, ID, proof of address, completed form RLV. Fees vary by vehicle type.",
  "vehicle disc": "License disc renewal: Can be done online, at post office, or DLTC. Need license disc reminder, ID, proof of address. Must renew annually.",
  "traffic fine": "To pay traffic fines: Online via payCity, at municipality offices, or selected retail stores. Need fine number and ID.",
  "book test": "Book driving test: Online via NaTIS portal, at DLTC, or through driving schools. Need learner's license and booking fee.",
  "k53": "K53 test: Includes yard test (vehicle controls), road test. Practice parallel parking, emergency stops, and three-point turns.",
  "contact traffic": "Contact: Call 0860 123 678 (RTMC), visit local traffic department, or check local municipality website.",
  "license expiry": "Driving licenses expire every 5 years. Renewal can be done online via NaTIS or at your local DLTC.",
  "lost license": "If you lose your license: Complete form ANR, provide ID, affidavit, proof of address. Replacement fee: R140.",
  "roadworthy": "Roadworthy test: Required for vehicle sales, re-registration, and certain license renewals. Cost: R300-R600 at Dekra testing stations.",
  "change ownership": "To change vehicle ownership: Complete form NCO, provide ID of buyer/seller, roadworthy certificate, registration certificate. Fee: R150.",
  "check fines": "Check outstanding fines: Visit traffic department, call AARTO call center, or check online with your ID number.",
  "dispute fine": "To dispute a fine: Complete representation form within 32 days, provide evidence, submit to issuing authority.",
  "aarto": "AARTO (Administrative Adjudication of Road Traffic Offences) manages traffic fines and demerit system nationwide.",
  "demerit points": "Demerit points: Each offense carries points (1-6). License suspended at 12 points, revoked at 15 points. Points expire after 3 years.",
  "reschedule test": "To reschedule: Contact DLTC 24+ hours before test. Late cancellations may forfeit booking fee.",
  "operating hours": "Traffic departments: Typically Mon-Fri 7:30AM-4PM, Sat 8AM-12PM (some branches). Check local office for exact times.",
  "documents needed": "Common documents: SA ID, proof of address (not older than 3 months), 2 ID photos, existing licenses/certificates.",
  "proof of address": "Acceptable proof: Utility bill, bank statement, lease agreement not older than 3 months. Must show your name and address.",
  "fees": "Common fees: Learner's R108, Driver's R228, License card R140, Vehicle registration R450-R900 depending on vehicle type.",
  "online services": "Available online: License renewal, fine payments, booking tests, disc renewals via NaTIS and municipal websites.",
  "accident": "After accident: Stop immediately, assist injured, exchange details, report to police within 24hrs if injuries or significant damage.",
  "vehicle impounded": "If vehicle impounded: Contact impound lot with registration, license, proof of ownership. Release fees apply.",
  "drunk driving": "Drunk driving limit: 0.05g/100ml blood (0.02g for professionals). Penalties include fines, imprisonment, license suspension.",
  "speed limit": "General speed limits: 60km/h in urban areas, 100km/h on rural roads, 120km/h on freeways unless otherwise posted.",
  "website": "Official websites: NaTIS online services, RTMC website, or your local municipality's traffic services page.",
  "complaint": "To complain: Contact station commander of traffic department, or escalate to Provincial Traffic Management.",
  "help": "Need more help? Visit your nearest DLTC with required documents, or call the national traffic information line 0860 123 678.",
  // Add these new responses for better coverage
  "register": "To register a vehicle in South Africa, you need: Original title deed, roadworthy certificate, ID, proof of address, and completed form RLV. Fees vary by vehicle type (typically R450-R900). You can do this at your local traffic department or online via NaTIS.",
  "licenses": "For license queries: Learner's License (17+ years, R108), Driver's License (testing, R228), or License Renewal (every 5 years, R228). Which specific license service do you need help with?",
  "fines": "For traffic fines: You can pay fines online via payCity, check outstanding fines with your ID number, or dispute fines within 32 days. Which action do you need help with?",
  "tests": "For driving tests: You can book tests online via NaTIS, learn about K53 requirements, or prepare for the practical exam. What specific test information do you need?"
};

export default function ApplicantDashboard({ userData }) {
  const navigate = useNavigate();
  const [userLicenses, setUserLicenses] = useState([]); // Array to hold both license types
  const [hasAnyLicense, setHasAnyLicense] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseType, setLicenseType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseIssueDate, setLicenseIssueDate] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const [userVehicles, setUserVehicles] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [licenseError, setLicenseError] = useState("");
  
  // Chatbot state
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  // ✅ Authentication check
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const currentUser = userData || storedUser;
      
      if (!currentUser || !currentUser.userId) {
        navigate("/login");
      }
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [userData, navigate]);

  // ✅ Refresh bookings if a new booking was just made
  useEffect(() => {
    const shouldRefresh = localStorage.getItem("refreshBookings");
    if (shouldRefresh) {
      localStorage.removeItem("refreshBookings");
      if (userData?.userId) {
        fetchUserBookings();
      }
    }
  }, [userData]);

  // Fetch user license information
  useEffect(() => {
    if (userData?.userId) {
      fetchUserLicense();
    }
  }, [userData]);

  // Fetch user vehicles
  useEffect(() => {
    if (userData?.userId) {
      fetchUserVehicles();
    }
  }, [userData]);

  // Fetch user bookings
  useEffect(() => {
    if (userData?.userId) {
      fetchUserBookings();
    }
  }, [userData]);

  // ✅ NEW: Auto-calculate expiry date when issue date changes
  useEffect(() => {
    if (licenseIssueDate && licenseType) {
      const issueDate = new Date(licenseIssueDate);
      let expiryDate = new Date(issueDate);
      
      if (licenseType === "Driver's License") {
        // Driver's License expires after 5 years
        expiryDate.setFullYear(expiryDate.getFullYear() + 5);
      } else {
        // Learner's License expires after 2 years
        expiryDate.setFullYear(expiryDate.getFullYear() + 2);
      }
      
      setLicenseExpiryDate(expiryDate.toISOString().split('T')[0]);
    }
  }, [licenseIssueDate, licenseType]);

  // ✅ NEW: Validate license number format in real-time
  useEffect(() => {
    if (licenseNumber && licenseType) {
      validateLicenseNumber(licenseNumber, licenseType);
    } else {
      setLicenseError("");
    }
  }, [licenseNumber, licenseType]);

  // Helper function to check if message contains any of the keywords
  const containsAny = (message, keywords) => {
    return keywords.some(keyword => message.includes(keyword));
  };

  // Improved Chatbot function with better keyword matching
  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase().trim();
    
    // Define keyword groups and their responses
    const keywordGroups = {
      // License related keywords
      license: [
        'learners', 'learner', 'learners license', 'learner license', 'learners licence', 'learner licence',
        'drivers', 'driver', 'drivers license', 'driver license', 'drivers licence', 'driver licence',
        'license', 'licence', 'dl', 'll', 'l license', 'd license'
      ],
      // Vehicle registration related keywords
      registration: [
        'register', 'registration', 'register vehicle', 'vehicle registration', 'register car', 'car registration',
        'new vehicle', 'new car', 'add vehicle', 'add car', 'vehicle register', 'car register'
      ],
      // Vehicle disc related keywords
      disc: [
        'disc', 'license disc', 'vehicle disc', 'car disc', 'renew disc', 'disc renewal',
        'license disk', 'vehicle disk', 'car disk', 'renew disk', 'disk renewal',
        'renewal', 'renew', 'expiry', 'expire'
      ],
      // Fines related keywords
      fines: [
        'fine', 'fines', 'ticket', 'tickets', 'traffic fine', 'traffic ticket', 'pay fine', 'pay ticket',
        'outstanding', 'penalty', 'penalties', 'infringement', 'aarto'
      ],
      // Testing related keywords
      testing: [
        'test', 'testing', 'driving test', 'book test', 'test booking', 'k53', 'exam', 'examination',
        'practical', 'theory', 'yard test', 'road test', 'book driving', 'driving exam'
      ],
      // General information
      general: [
        'contact', 'phone', 'email', 'address', 'location', 'where', 'hours', 'operating', 'open', 'close',
        'documents', 'papers', 'requirements', 'what need', 'what documents', 'proof', 'id', 'photos'
      ],
      // Fees and payments
      fees: [
        'fee', 'fees', 'cost', 'price', 'payment', 'pay', 'money', 'how much', 'amount', 'charge', 'charges'
      ]
    };

    // Check for exact matches first
    for (const key in trafficResponses) {
      if (message.includes(key)) {
        return trafficResponses[key];
      }
    }

    // Smart keyword matching with partial matches
    if (containsAny(message, keywordGroups.registration) || message.includes('regist') || message.includes('regis')) {
      return trafficResponses["register vehicle"] || "To register a vehicle in South Africa, you need: Original title deed, roadworthy certificate, ID, proof of address, and completed form RLV. Fees vary by vehicle type (typically R450-R900). You can do this at your local traffic department or online via NaTIS.";
    }
    
    if (containsAny(message, keywordGroups.license) || message.includes('licen')) {
      if (message.includes('learn') || message.includes('ll') || message.includes('l ')) {
        return trafficResponses["learners license"] || "For a learner's license: You must be 17+ years old, complete LL1 form, provide ID, 2 ID photos, proof of address, and pay R108 fee. Study the K53 manual for the test.";
      } else if (message.includes('driver') || message.includes('dl') || message.includes('d ')) {
        return trafficResponses["drivers license"] || "For a driver's license: You need a valid learner's license, complete DL1 form, pass eye test, provide ID, photos, proof of address. Fees: R228 for test, R140 for card.";
      } else if (message.includes('renew') || message.includes('expir')) {
        return trafficResponses["renew license"] || "License renewal: Must be done 4 weeks before expiry at DLTC. Bring ID, current license, proof of address, eye test certificate. Fee: R228.";
      } else {
        return "For license queries: Are you asking about Learner's License (17+ years), Driver's License (testing), or License Renewal (every 5 years)? Please specify which one.";
      }
    }
    
    if (containsAny(message, keywordGroups.disc) || message.includes('disc') || message.includes('disk')) {
      return trafficResponses["vehicle disc"] || "License disc renewal: Can be done online, at post office, or DLTC. Need license disc reminder, ID, proof of address. Must renew annually. Late renewals incur penalties of R60 per month.";
    }
    
    if (containsAny(message, keywordGroups.fines) || message.includes('fine') || message.includes('ticket')) {
      if (message.includes('pay') || message.includes('payment')) {
        return trafficResponses["traffic fine"] || "To pay traffic fines: Online via payCity, at municipality offices, or selected retail stores. Need fine number and ID.";
      } else if (message.includes('check') || message.includes('outstanding') || message.includes('view')) {
        return trafficResponses["check fines"] || "Check outstanding fines: Visit traffic department, call AARTO call center, or check online with your ID number.";
      } else if (message.includes('dispute') || message.includes('contest') || message.includes('fight')) {
        return trafficResponses["dispute fine"] || "To dispute a fine: Complete representation form within 32 days, provide evidence, submit to issuing authority.";
      } else {
        return "For traffic fines: You can pay fines online, check outstanding fines, or dispute fines. Which specific action do you need help with?";
      }
    }
    
    if (containsAny(message, keywordGroups.testing) || message.includes('test') || message.includes('exam') || message.includes('k53')) {
      if (message.includes('book') || message.includes('schedule') || message.includes('appointment')) {
        return trafficResponses["book test"] || "Book driving test: Online via NaTIS portal, at DLTC, or through driving schools. Need learner's license and booking fee.";
      } else if (message.includes('k53') || message.includes('what test') || message.includes('include')) {
        return trafficResponses["k53"] || "K53 test: Includes yard test (vehicle controls), road test. Practice parallel parking, emergency stops, and three-point turns.";
      } else {
        return "For driving tests: You can book tests, learn about K53 requirements, or prepare for the test. What specific test information do you need?";
      }
    }
    
    if (containsAny(message, keywordGroups.fees) || message.includes('how much') || message.includes('cost') || message.includes('price')) {
      return trafficResponses["fees"] || "Common fees: Learner's License R108, Driver's License test R228, License card R140, Vehicle registration R450-R900 depending on vehicle type, Roadworthy test R300-R600.";
    }
    
    if (containsAny(message, keywordGroups.general) || message.includes('contact') || message.includes('where') || message.includes('when')) {
      if (message.includes('contact') || message.includes('phone') || message.includes('call')) {
        return trafficResponses["contact traffic"] || "Contact: Call 0860 123 678 (RTMC), visit local traffic department, or check local municipality website for specific offices.";
      } else if (message.includes('hours') || message.includes('open') || message.includes('close') || message.includes('operating')) {
        return trafficResponses["operating hours"] || "Traffic departments: Typically Mon-Fri 7:30AM-4PM, Sat 8AM-12PM (some branches). Check local office for exact times.";
      } else if (message.includes('documents') || message.includes('papers') || message.includes('what need') || message.includes('requirements')) {
        return trafficResponses["documents needed"] || "Common documents: SA ID, proof of address (not older than 3 months), 2 ID photos, existing licenses/certificates. Specific requirements vary by service.";
      }
    }

    // Fallback for partial matches in the original responses
    for (const key in trafficResponses) {
      const words = key.split(' ');
      for (const word of words) {
        if (message.includes(word) && word.length > 3) { // Only match words longer than 3 characters
          return trafficResponses[key];
        }
      }
    }

    return "I'm here to help with South African traffic department services. Ask me about licenses, vehicle registration, fines, driving tests, or general traffic information. Try words like 'register', 'license', 'fine', 'disc', or 'test' and I'll understand what you need!";
  };

  const validateLicenseNumber = (number, type) => {
    const cleanedNumber = number.trim();
    
    if (type === "Driver's License") {
      // Driver's License: 8-13 alphanumeric characters
      if (cleanedNumber.length < 8 || cleanedNumber.length > 13) {
        setLicenseError("Driver's License number should be between 8 and 13 characters");
        return false;
      }
      if (!/^[a-zA-Z0-9]+$/.test(cleanedNumber)) {
        setLicenseError("Driver's License number should contain only letters and numbers");
        return false;
      }
    } else {
      // Learner's License exactly 13 digits
      if (cleanedNumber.length !== 13) {
        setLicenseError("Learner's License number should be exactly 13 digits");
        return false;
      }
      if (!/^\d+$/.test(cleanedNumber)) {
        setLicenseError("Learner's License number should contain only digits");
        return false;
      }
    }
    
    setLicenseError("");
    return true;
  };

  const fetchUserLicense = async () => {
    try {
      const response = await ApiService.getApplicantById(userData.userId);
      console.log('🔍 License fetch response:', response);
      
      if (response) {
        const licenses = [];
        
        // Add license if exists
        if (response.license) {
          licenses.push({
            licenseCode: response.license.licenseCode,
            licenseType: "Driver's License",
            issueDate: response.license.issueDate || "N/A",
            expiryDate: response.license.expiryDate || null,
            type: "drivers"
          });
        }
        
        // Add learners if exists
        if (response.learners) {
          licenses.push({
            licenseCode: response.learners.learnersCode,
            licenseType: "Learner's License",
            issueDate: response.learners.issueDate || "N/A",
            expiryDate: response.learners.expiryDate || null,
            type: "learners"
          });
        }
        
        // Fallback to old structure if needed
        if (licenses.length === 0 && response.licenseCode) {
          const normalizedType = response.licenseType?.toLowerCase() || "drivers";
          licenses.push({
            licenseCode: response.licenseCode,
            licenseType: response.licenseType || "Driver's License",
            issueDate: response.issueDate || "N/A",
            expiryDate: response.expiryDate || null,
            type: normalizedType
          });
        }
        
        setUserLicenses(licenses);
        setHasAnyLicense(licenses.length > 0);
        
      }
    } catch (error) {
      console.error("Error fetching user license:", error);
      setHasAnyLicense(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVehicles = async () => {
    try {
      const data = await ApiService.getVehiclesByUser(userData.userId);
      setUserVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching user's vehicles:", error);
      setUserVehicles([]);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const response = await ApiService.getUserBookings(userData.userId);
      if (response.success) {
        const bookings = Array.isArray(response.data) ? response.data : [response.data];
        const formattedBookings = bookings.map(booking => ({
          id: booking.testAppointmentId || booking.id,
          type: booking.testype === 'DRIVERSLICENSETEST' ? 'Drivers Test' : 'Learners Test',
          date: booking.testDate,
          time: booking.testTime,
          status: booking.testResult === null 
            ? 'Pending' 
            : booking.testResult 
              ? 'Passed' 
              : 'Failed'
        }));
        setUserBookings(formattedBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setUserBookings([]);
    }
  };

  const handleLicenseSelection = (type) => {
    setLicenseType(type);
    setLicenseNumber("");
    setLicenseIssueDate("");
    setLicenseExpiryDate("");
    setLicenseError("");
    setShowLicenseModal(true);
  };

  // ✅ UPDATED: Save license/learners with proper validation
  const saveLicenseInfo = async () => {
    try {
      console.log('🔍 STARTING LICENSE SAVE PROCESS');
      
      // Validate required fields
      if (!licenseNumber.trim()) {
        alert("Please enter the license/License number");
        return;
      }

      // ✅ VALIDATE LICENSE NUMBER FORMAT
      if (!validateLicenseNumber(licenseNumber, licenseType)) {
        alert("Please fix the license number format before saving");
        return;
      }

      if (!licenseIssueDate) {
        alert("Please select the issue date");
        return;
      }

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const currentUser = userData || storedUser;

      if (!currentUser || !currentUser.userId) {
        alert("User session expired. Please login again.");
        navigate("/login");
        return;
      }

      const applicantId = currentUser.userId;

      // Prepare license/learners data
      const documentData = {
        licenseCode: licenseNumber.trim(),
        learnersCode: licenseNumber.trim(),
        issueDate: licenseIssueDate,
        expiryDate: licenseExpiryDate
      };

      let result;

      // Use the new API methods based on license type
      if (licenseType === "Driver's License") {
        console.log('💾 Saving Driver License...');
        result = await ApiService.saveLicense(applicantId, documentData);
      } else {
        console.log('💾 Saving Learners License...');
        result = await ApiService.saveLearners(applicantId, documentData);
      }

      console.log('✅ API Response:', result);

      if (result.success) {
        // Add the new license to the existing licenses array
        const newLicense = {
          licenseCode: licenseNumber.trim(),
          licenseType: licenseType,
          issueDate: licenseIssueDate,
          expiryDate: licenseExpiryDate,
          type: licenseType.toLowerCase().includes("driver") ? "drivers" : "learners"
        };
        
        setUserLicenses(prevLicenses => {
          // Remove existing license of same type if it exists
          const filteredLicenses = prevLicenses.filter(license => 
            license.type !== newLicense.type
          );
          return [...filteredLicenses, newLicense];
        });
        
        setHasAnyLicense(true);
        setShowLicenseModal(false);
        setLicenseNumber("");
        setLicenseIssueDate("");
        setLicenseExpiryDate("");
        setLicenseError("");
        
        // Refresh to show updated licenses
        fetchUserLicense();
        
        alert(`${licenseType} saved successfully!`);
      } else {
        alert(result.message || "Failed to save license information.");
      }
    } catch (error) {
      console.error("❌ Failed to save license info:", error);
      console.error("❌ Error details:", error.response?.data);
      alert("Failed to save license information. Please try again.");
    }
  };

  const sendMessage = () => {
    const message = userInput.trim();
    if (!message) return;

    // Add user message
    const newUserMessage = { type: 'user', text: message };
    setChatMessages(prev => [...prev, newUserMessage]);

    // Get and add bot response
    const botResponse = getBotResponse(message);
    const newBotMessage = { type: 'bot', text: botResponse };
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, newBotMessage]);
    }, 500);

    // Clear input
    setUserInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const quickQuestions = [
    "How to get learners license?",
    "Renew vehicle disc",
    "Pay traffic fine",
    "Book driving test",
    "License renewal"
  ];

  const handleQuickQuestion = (question) => {
    setUserInput(question);
  };

  const services = [
    {
      title: "Book Learners Test",
      description: "Schedule your learners license test",
      image: learners,
      action: () => navigate("/booking?type=learners", { state: { userData } }),
      requires: null,
    },
    {
      title: "Book Drivers Test",
      description: "Schedule your drivers license test",
      image: learnersTestImg,
      action: () => navigate("/booking?type=drivers", { state: { userData } }),
      requires: "learners",
    },
    {
      title: "Register Vehicle",
      description: "Register your vehicle and get disc",
      image: driversTestImg,
      action: () => navigate("/VehicleRegistration"),
      requires: null,
    },
    {
      title: "Renew Vehicle Disc",
      description: "Renew your vehicle disc",
      image: disc,
      action: () => navigate("/renew-disc", { state: { user: userData } }),
      requires: null,
    },
    {
      title: "Pay Traffic Ticket",
      description: "Pay outstanding traffic fines",
      image: payTicketImg,
      action: () => navigate("/pay-ticket"),
      requires: null,
    },
    {
      title: "Payments History",
      description: "View payments for the user",
      image: payTicketImg,
      action: () => navigate("/payments"),
      requires: null,
    },
  ];

  // delete vehicle
  const handleDeleteVehicle = async (vehicleID) => {
    const confirmed = window.confirm("Are you sure you want to delete this vehicle?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await ApiService.deleteVehicle(vehicleID);
      if (response && response === "Vehicle deleted successfully") {
        alert("Vehicle deleted successfully");
        setUserVehicles(prevVehicles =>
          prevVehicles.filter(v => v.vehicleID !== vehicleID)
        );
      } else {
        alert(response || "Could not delete vehicle. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error.response?.data || error.message);
      alert(error.response?.data || "An error occurred while deleting the vehicle.");
    }
  };

  // view vehicle
  const handleViewVehicle = (vehicle) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const currentUser = userData || storedUser;
    
    console.log("🔍 handleViewVehicle - currentUser:", currentUser);
    
    const fetchCompleteUserData = async () => {
      try {
        const completeUser = await ApiService.getUserById(currentUser.userId);
        console.log("🔍 handleViewVehicle - completeUser from API:", completeUser);
        
        navigate("/vehicle-profile", {
          state: {
            vehicle,
            user: completeUser,
          },
        });
      } catch (error) {
        console.error("Error fetching complete user data:", error);
        navigate("/vehicle-profile", {
          state: {
            vehicle,
            user: currentUser,
          },
        });
      }
    };

    fetchCompleteUserData();
  };

  // Updated license type checking logic
  const canAccessService = (service) => {
    if (!service.requires) return true;
    
    if (userLicenses.length === 0) return false;
    
    const hasLearners = userLicenses.some(license => 
      license.type === "learners" || 
      license.licenseType.toLowerCase().includes("learner")
    );
    
    if (service.requires === "learners") {
      return hasLearners;
    }
    
    return false;
  };

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      text: "This platform made my vehicle disc renewal process incredibly smooth and hassle-free. I highly recommend their service!",
      author: "SOPHIA R.",
      rating: 5,
    },
    {
      id: 2,
      text: "The ticket payment system saved me so much time. What used to take hours now takes minutes!",
      author: "MICHAEL T.",
      rating: 5,
    },
    {
      id: 3,
      text: "Booking my driver's test was incredibly easy. The whole process was straightforward and efficient.",
      author: "JAMES L.",
      rating: 4,
    },
  ];

  // Function to render star ratings
  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  // Handle loading state
  if (loading) {
    return (
      <SharedLayout>
        <div className="container py-5">
          <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </SharedLayout>
    );
  }

  // Handle case where userData is not available
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUser = userData || storedUser;
  
  if (!currentUser || !currentUser.userId) {
    return (
      <SharedLayout>
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            <h4>User not found. Please login again.</h4>
            <button className="btn btn-primary mt-3" onClick={() => navigate("/login")}>
              Go to Login
            </button>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout user={currentUser}>
      <div className="container-fluid px-0">
        {/* Floating Chatbot Icon */}
        {!showChatbot && (
          <div 
            className="chatbot-icon"
            onClick={() => setShowChatbot(true)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              backgroundColor: '#0d6efd',
              color: 'white',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 1000,
              fontSize: '24px',
              transition: 'all 0.3s ease'
            }}
          >
            <FontAwesomeIcon icon={faCommentDots} />
          </div>
        )}

        {/* Chatbot Modal */}
        {showChatbot && (
          <div 
            className="chatbot-modal"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '350px',
              height: '500px',
              backgroundColor: 'white',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Chat Header */}
            <div 
              className="chat-header"
              style={{
                backgroundColor: '#0d6efd',
                color: 'white',
                padding: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FontAwesomeIcon icon={faCar} />
                <h6 className="mb-0 fw-bold">Traffic Department Assistant</h6>
              </div>
              <button 
                onClick={() => setShowChatbot(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Quick Questions */}
            <div 
              className="quick-questions"
              style={{
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #dee2e6'
              }}
            >
              <small className="text-muted d-block mb-2">Quick questions:</small>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    style={{
                      background: 'white',
                      border: '1px solid #dee2e6',
                      borderRadius: '15px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#0d6efd';
                      e.target.style.color = 'white';
                      e.target.style.borderColor = '#0d6efd';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.color = 'inherit';
                      e.target.style.borderColor = '#dee2e6';
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div 
              className="chat-messages"
              style={{
                flex: 1,
                padding: '15px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {chatMessages.length === 0 && (
                <div 
                  className="welcome-message"
                  style={{
                    backgroundColor: '#e7f3ff',
                    padding: '10px',
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}
                >
                  <strong>Welcome! 👋</strong><br/>
                  I can help with licenses, vehicle registration, fines, and driving tests. Ask me anything!
                </div>
              )}
              
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: message.type === 'user' ? '#0d6efd' : '#e9ecef',
                    color: message.type === 'user' ? 'white' : 'black',
                    padding: '8px 12px',
                    borderRadius: '15px',
                    maxWidth: '80%',
                    fontSize: '12px',
                    lineHeight: '1.4'
                  }}
                >
                  {message.text}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div 
              className="input-area"
              style={{
                padding: '15px',
                borderTop: '1px solid #dee2e6',
                display: 'flex',
                gap: '10px'
              }}
            >
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about traffic services..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '20px',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  backgroundColor: '#0d6efd',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 15px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Rest of your existing JSX remains exactly the same */}
        {/* Hero Section */}
        <section
          style={{
            width: "100%",
            minHeight: "450px",
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${driversTestImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            textAlign: "center",
            padding: "2rem 1rem",
          }}
        >
          <div className="px-3" style={{ maxWidth: "800px" }}>
            <h1 className="display-4 fw-bold mb-3">
              Welcome, {currentUser.firstName}!
            </h1>
            {userLicenses.length > 0 && (
              <div className="lead mt-3 fs-4">
                Licenses: {userLicenses.map(license => 
                  `${license.licenseCode} (${license.licenseType})`
                ).join(' | ')}
              </div>
            )}
            <p className="lead mt-3 fs-4">
              Your one-stop solution for licensing, fines management, and test bookings
            </p>
            <button
              className="btn btn-primary btn-lg mt-4 px-4 py-2"
              onClick={() =>
                document
                  .getElementById("services-section")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Services
            </button>
          </div>
        </section>

        {/* About Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="fw-bold mb-4">About Our Service</h2>
                <p className="lead text-muted">
                  At our core, we strive to simplify your vehicle-related
                  bureaucratic tasks. Our platform enables you to seamlessly
                  register for vehicle discs, pay off tickets swiftly, and easily
                  book appointments for learners and drivers tests.
                </p>
                <p className="text-muted">
                  We aim to save you time and provide peace of mind, ensuring
                  smooth processes for all your vehicular needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Full-width CTA Section */}
        <section
          className="py-5 rounded-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${registerVehicleImg})`,
            backgroundSize: "70%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center text-white">
                <h2 className="display-5 fw-bold mb-4">Ready to Get Started?</h2>
                <p className="lead mb-4">
                  Join thousands of satisfied customers who have simplified their
                  vehicle documentation process with our services.
                </p>
                <button
                  className="btn btn-primary btn-lg px-4 py-2"
                  onClick={() =>
                    document
                      .getElementById("services-section")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore Our Services
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* User Info Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="text-center mb-5">
                  <h2 className="fw-bold">Your Driving Information</h2>
                  <p className="text-muted">
                    Please let us know which license(s) you currently hold. This
                    helps us provide you with the right services.
                  </p>
                </div>

                {/* License Info */}
                {userLicenses.length > 0 ? (
                  <div className="mb-4">
                    {userLicenses.map((license, index) => (
                      <div key={index} className="card shadow-sm border-0 p-4 mb-3 rounded-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="fw-bold mb-1 text-success">
                              ✓ {license.licenseType}
                            </h5>
                            <p className="mb-1 fw-medium">
                              Document Number: {license.licenseCode}
                            </p>
                            <p className="text-muted mb-0">
                              Issue Date: {license.issueDate}
                              {license.expiryDate && ` | Expiry Date: ${license.expiryDate}`}
                            </p>
                          </div>
                          <div
                            style={{
                              width: "120px",
                              height: "70px",
                              backgroundColor: license.type === "drivers" ? "#e8f5e8" : "#e3f2fd",
                              border: license.type === "drivers" ? "2px solid #28a745" : "2px solid #2196f3",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "bold",
                              color: license.type === "drivers" ? "#28a745" : "#2196f3"
                            }}
                          >
                            {license.type === "drivers" ? "LICENSE" : "LEARNERS"}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add another license button - only show if user doesn't have both types */}
                    {userLicenses.length < 2 && (
                      <div className="text-center mt-3">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => {
                            // Determine which license type to offer based on what they already have
                            const hasDrivers = userLicenses.some(license => license.type === "drivers");
                            const hasLearners = userLicenses.some(license => license.type === "learners");
                            
                            if (hasDrivers && !hasLearners) {
                              handleLicenseSelection("Learner's License");
                            } else if (hasLearners && !hasDrivers) {
                              handleLicenseSelection("Driver's License");
                            } else {
                              // If somehow both are missing, show both options in modal
                              setLicenseType("");
                              setShowLicenseModal(true);
                            }
                          }}
                        >
                          + Add {userLicenses.length === 0 ? "License" : "Another License"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="card shadow-sm border-0 p-4 mb-4 rounded-4">
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-around">
                      <h5 className="me-3 text-center text-md-start mb-3 mb-md-0">
                        Do you have a driver's license or learner's License?
                      </h5>
                      <div>
                        <button
                          className="btn btn-outline-primary me-2 mb-2 mb-md-0"
                          onClick={() => handleLicenseSelection("Driver's License")}
                        >
                          Driver's License
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleLicenseSelection("Learner's License")}
                        >
                          Learner's License
                        </button>
                      </div>
                    </div>
                    <div className="text-center text-muted mt-3">
                      <small>Adding your license information unlocks relevant services</small>
                    </div>
                  </div>
                )}

                {/* Recent Bookings & My Vehicles */}
                <div className="row mt-4">
                  <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                      <div className="card-header bg-primary text-white fw-bold">
                        Recent Bookings
                      </div>
                      <div className="card-body">
                        {userBookings && userBookings.length > 0 ? (
                          userBookings.slice(0, 3).map((booking, index) => (
                            <div
                              key={booking.id || index}
                              className="mb-3 p-3 bg-light rounded-3"
                            >
                              <h6 className="fw-medium mb-1">{booking.type}</h6>
                              <p className="text-muted small mb-0">
                                <strong>Data:</strong> {booking.date} <br />
                                <strong>Time:</strong> {booking.time || 'N/A'} <br />
                                <strong>Status:</strong> {booking.status}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted">No bookings yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                      <div className="card-header bg-primary text-white fw-bold">
                        My Vehicles
                      </div>
                      <div
                        className="card-body"
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                      >
                        {userVehicles && userVehicles.length > 0 ? (
                          userVehicles.map((vehicle, index) => (
                            <div
                              key={vehicle.vehicleID || index}
                              className="mb-3 p-3 bg-light rounded-3 d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <h6 className="fw-medium mb-1">
                                  {vehicle.vehicleName}
                                </h6>
                                <p className="text-muted small mb-0">
                                  License Number: {vehicle.licensePlate}
                                </p>
                              </div>

                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleViewVehicle(vehicle)}
                                >
                                  View
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() =>
                                    handleDeleteVehicle(vehicle.vehicleID)
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted">No vehicles registered yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services-section" className="py-5">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="fw-bold">SERVICES</h2>
              <div
                className="mx-auto"
                style={{
                  height: "3px",
                  width: "80px",
                  backgroundColor: "#0d6efd",
                }}
              ></div>
            </div>

            <div className="row g-4">
              {services.map((service, index) => {
                const disabled = service.requires && !canAccessService(service);
                return (
                  <div key={index} className="col-12 col-md-6 col-lg-4">
                    <div
                      className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden ${
                        disabled ? "bg-light" : ""
                      }`}
                      style={{
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: disabled ? 0.6 : 1,
                        transition: "transform 0.3s, box-shadow 0.3s",
                      }}
                      onClick={disabled ? null : service.action}
                      onMouseOver={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.transform = "translateY(-5px)";
                          e.currentTarget.style.boxShadow =
                            "0 12px 24px rgba(0,0,0,0.15)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 6px rgba(0,0,0,0.1)";
                        }
                      }}
                    >
                      <div
                        style={{
                          height: "200px",
                          backgroundImage: `url(${service.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>
                      <div className="card-body text-center p-4">
                        <h4 className="fw-bold mb-3">{service.title}</h4>
                        <p className="text-muted mb-0">{service.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="fw-bold">TESTIMONIALS</h2>
              <div
                className="mx-auto"
                style={{
                  height: "3px",
                  width: "80px",
                  backgroundColor: "#0d6efd",
                }}
              ></div>
            </div>

            <div className="row g-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
                    <div className="text-warning mb-3 fs-5">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="fst-italic mb-4">"{testimonial.text}"</p>
                    <p className="fw-bold text-primary mb-0">
                      {testimonial.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* License Modal */} 
        {showLicenseModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-primary text-white border-0 rounded-top">
                  <h5 className="modal-title fw-bold">
                    {licenseType ? `Add Your ${licenseType}` : "Add License Information"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowLicenseModal(false)}
                  ></button>
                </div>
                
                <div className="modal-body p-4">
                  {/* Info Alert */}
                  <div className="alert alert-info border-0 mb-4" style={{ backgroundColor: '#e8f4fd' }}>
                    <div className="d-flex align-items-start">
                      <i className="bi bi-info-circle-fill text-primary me-2 mt-1"></i>
                      <div>
                        <small className="fw-medium">
                          {licenseType 
                            ? `Adding your ${licenseType.toLowerCase()} information helps unlock relevant services.` 
                            : "Select the type of license you want to add."
                          }
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  {/* License type selection */}
                  {!licenseType && (
                    <div className="mb-4">
                      <label className="form-label fw-semibold mb-3">What type of license do you have?</label>
                      <div className="d-flex gap-3">
                        <button
                          type="button"
                          className={`btn ${licenseType === "Driver's License" ? "btn-primary" : "btn-outline-primary"} flex-fill py-3`}
                          onClick={() => setLicenseType("Driver's License")}
                          style={{ borderRadius: '8px' }}
                        >
                          <div className="fw-semibold">Driver's License</div>
                          <small className="d-block mt-1 opacity-75">Valid for 5 years</small>
                        </button>
                        <button
                          type="button"
                          className={`btn ${licenseType === "Learner's License" ? "btn-primary" : "btn-outline-primary"} flex-fill py-3`}
                          onClick={() => setLicenseType("Learner's License")}
                          style={{ borderRadius: '8px' }}
                        >
                          <div className="fw-semibold">Learner's License</div>
                          <small className="d-block mt-1 opacity-75">Valid for 2 years</small>
                        </button>
                      </div>
                    </div>
                  )}

                  {licenseType && (
                    <>
                      {/* License Number Input */}
                      <div className="mb-4">
                        <label className="form-label fw-semibold">
                          {licenseType} Number
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-lg ${licenseError ? 'is-invalid' : ''}`}
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          placeholder={
                            licenseType === "Driver's License" 
                              ? "e.g. DL12345678" 
                              : "e.g. 8501015111089"
                          }
                          style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                          maxLength={licenseType === "Driver's License" ? 13 : 13}
                          required
                        />
                        {licenseError ? (
                          <div className="invalid-feedback d-block fw-medium">{licenseError}</div>
                        ) : (
                          <div className="form-text text-muted">
                            {licenseType === "Driver's License" 
                              ? "8-13 letters and numbers" 
                              : "13 numbers only"
                            }
                          </div>
                        )}
                      </div>

                      {/* Date Inputs */}
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Issue Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={licenseIssueDate}
                            onChange={(e) => setLicenseIssueDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Expiry Date</label>
                          <input
                            type="date"
                            className="form-control bg-light"
                            value={licenseExpiryDate}
                            readOnly
                            disabled
                            style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                          />
                          <div className="form-text text-muted">
                            {licenseType === "Driver's License" 
                              ? "5 years from issue"
                              : "2 years from issue"
                            }
                          </div>
                        </div>
                      </div>
                      
                      {/* Expiry Summary */}
                      {licenseIssueDate && (
                        <div className="alert alert-warning border-0 mb-3" style={{ backgroundColor: '#fff9e6' }}>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-calendar-check text-warning me-2"></i>
                            <div>
                              <small className="fw-medium">Expiry Summary</small>
                              <div className="small">
                                Issue: {new Date(licenseIssueDate).toLocaleDateString()} • 
                                Expiry: {new Date(licenseExpiryDate).toLocaleDateString()} • 
                                {licenseType === "Driver's License" ? " 5 years" : " 2 years"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Help Text */}
                  <div className="border-top pt-3 mt-3">
                    <small className="text-muted">
                      <i className="bi bi-shield-check me-1"></i>
                      Your information is secure and only used to provide you with relevant services.
                    </small>
                  </div>
                </div>
                
                <div className="modal-footer border-0 rounded-bottom">
                  <button
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setShowLicenseModal(false)}
                    style={{ borderRadius: '8px' }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary px-4 fw-semibold"
                    onClick={saveLicenseInfo}
                    disabled={!licenseNumber.trim() || !licenseIssueDate || !licenseType || licenseError}
                    style={{ borderRadius: '8px' }}
                  >
                    Save {licenseType || "License"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showLicenseModal && <div className="modal-backdrop show"></div>}
      </div>

      {/* Add Bootstrap Icons CSS */}
      <style jsx>{`
        @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css");
        
        .modal-content {
          border-radius: 12px !important;
        }
        
        .modal-header {
          border-radius: 12px 12px 0 0 !important;
          padding: 1.25rem 1.5rem;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .modal-footer {
          padding: 1.25rem 1.5rem;
        }
        
        .btn {
          border-radius: 8px;
          transition: all 0.2s ease-in-out;
        }
        
        .btn:hover {
          transform: translateY(-1px);
        }
        
        .form-control {
          transition: border-color 0.2s ease-in-out;
        }
        
        .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.1);
        }
        
        .chatbot-icon:hover {
          transform: scale(1.1);
          background-color: #0b5ed7 !important;
        }
        
        .chat-messages::-webkit-scrollbar {
          width: 5px;
        }
        
        .chat-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .chat-messages::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
      `}</style>
    </SharedLayout>
  );
}