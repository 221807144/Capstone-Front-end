import axios from "axios";

const API_BASE_URL = "http://localhost:8080/capstone";

// ✅ JWT Token Management
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// ✅ Add JWT token to all requests automatically
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Handle authentication errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

function extractErrorMessage(error) {
  if (error.response) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (data.error) return data.error;
    if (data.message) return data.message;
    return JSON.stringify(data);
  } else if (error.request) {
    return "No response from server - Check if backend is running";
  } else {
    return error.message;
  }
}

class ApiService {
    
    // ==================== AUTHENTICATION ====================
    static async registerUser(userData) {
      try {
        console.log("🔄 Attempting registration...", userData);
        
        const email = userData.contact.email;
        const endpoint = email.endsWith('@admin.co.za') 
          ? `${API_BASE_URL}/admins/create` 
          : `${API_BASE_URL}/applicants/create`;
        
        console.log("📡 Calling:", endpoint);
        
        const response = await axios.post(endpoint, userData);
        console.log("✅ Registration successful:", response.data);
        return response.data;
        
      } catch (error) {
        console.error("❌ Registration failed:", error);
        const errorMsg = extractErrorMessage(error);
        throw errorMsg;
      }
    }

    static async loginUser(email, password) {
      try {
        console.log("🔄 Attempting login...", email);
        
        let endpoint, requestData;
        
        // Determine which endpoint to use based on email domain
        if (email.endsWith('@admin.co.za')) {
          endpoint = `${API_BASE_URL}/admins/login`;
          requestData = { contact: { email }, password };
        } else {
          endpoint = `${API_BASE_URL}/applicants/login`;
          requestData = { contact: { email }, password };
        }
        
        console.log("📡 Calling:", endpoint);
        
        const response = await axios.post(endpoint, requestData);
        console.log("✅ Login response received:", response.data);
        
        if (response.data.success) {
          // ✅ Store JWT token and user info
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('role', response.data.role);
          
          console.log("✅ Login successful - data stored in localStorage");
        }
        
        return response.data;
        
      } catch (error) {
        console.error("❌ Login failed:", error);
        const errorMsg = extractErrorMessage(error);
        throw errorMsg;
      }
    }

    // ✅ Check if user is authenticated
    static isAuthenticated() {
      return !!localStorage.getItem('token');
    }

    // ✅ Get current user role
    static getCurrentUserRole() {
      return localStorage.getItem('role');
    }

    // ✅ Get current user data
    static getCurrentUser() {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }

    // ✅ Logout function
    static logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }

    // ==================== APPLICANT METHODS ====================
    
    // ✅ GET APPLICANT BY ID - CRITICAL METHOD THAT WAS MISSING
    static async getApplicantById(userId) {
      try {
        console.log("🔄 Getting applicant by ID:", userId);
        const response = await axios.get(
          `${API_BASE_URL}/applicants/${userId}`
        );
        console.log("✅ Applicant data received:", response.data);
        return response.data;
      } catch (error) {
        console.error("❌ Error getting applicant:", error);
        throw error;
      }
    }

    // ✅ FIXED: UPDATE APPLICANT - NOW ACCEPTS ONLY ONE PARAMETER
    static async updateApplicant(applicantData) {
      try {
        console.log("🔄 Updating applicant with data:", applicantData);
        console.log("📦 Full update data:", applicantData);
        
        // ✅ FIX: Use the applicantData directly (no userId parameter)
        const updateData = {
          ...applicantData
        };
        
        console.log("📤 Final update data being sent:", updateData);
        
        const response = await axios.put(
          `${API_BASE_URL}/applicants/update`,
          updateData
        );
        console.log("✅ Applicant updated successfully:", response.data);
        return response.data;
      } catch (error) {
        console.error("❌ Error updating applicant:", error);
        throw error;
      }
    }

    // ✅ TEMPORARY DEBUG FUNCTION - Add this to test the update
    static async debugUpdateApplicant(testData) {
      console.log('🐛 DEBUG: Testing updateApplicant with:', testData);
      
      try {
        const response = await axios.put(
          `${API_BASE_URL}/applicants/update`,
          testData
        );
        console.log('✅ DEBUG: Update successful:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ DEBUG: Update failed:', error);
        console.error('❌ DEBUG: Error response:', error.response?.data);
        throw error;
      }
    }

    // ==================== LICENSE & LEARNERS METHODS ====================

    // ✅ CREATE LICENSE
    static async createLicense(licenseData) {
      try {
        console.log("🔄 Creating license:", licenseData);
        const response = await axios.post(
          `${API_BASE_URL}/license/create`,
          licenseData
        );
        console.log("✅ License created successfully:", response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error("❌ License creation error:", error);
        return { success: false, error: extractErrorMessage(error) };
      }
    }

    // ✅ CREATE LEARNERS
    static async createLearners(learnersData) {
      try {
        console.log("🔄 Creating learners:", learnersData);
        const response = await axios.post(
          `${API_BASE_URL}/learners/create`,
          learnersData
        );
        console.log("✅ Learners created successfully:", response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error("❌ Learners creation error:", error);
        return { success: false, error: extractErrorMessage(error) };
      }
    }

    // ✅ GET LICENSE BY USER
    static async getLicenseByUser(userId) {
      try {
        console.log("🔄 Getting license for user:", userId);
        const response = await axios.get(
          `${API_BASE_URL}/license/user/${userId}`
        );
        return response.data;
      } catch (error) {
        console.error("❌ Error fetching license:", error);
        throw error;
      }
    }

    // ✅ GET LEARNERS BY USER
    static async getLearnersByUser(userId) {
      try {
        console.log("🔄 Getting learners for user:", userId);
        const response = await axios.get(
          `${API_BASE_URL}/learners/user/${userId}`
        );
        return response.data;
      } catch (error) {
        console.error("❌ Error fetching learners:", error);
        throw error;
      }
    }

    // ==================== TEST APPOINTMENTS ====================
    static async createTestAppointment(appointmentData) {
      try {
        console.log("Sending appointment data:", JSON.stringify(appointmentData, null, 2));
        const response = await axios.post(
          `${API_BASE_URL}/test-appointments/create`,
          appointmentData
        );
        console.log("Appointment created successfully:", response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Full error:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        return { success: false, error: extractErrorMessage(error) };
      }
    }

    static async updateTestResult(testAppointmentId, testData) {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/admins/test-appointments/update-result/${testAppointmentId}`,
          testData
        );
        return response.data;
      } catch (error) {
        console.error("Error updating test result:", error.response?.data || error.message);
        throw error;
      }
    }

    static async getUserBookings(userId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/test-appointments/by-applicant/${userId}`);
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Error fetching user bookings:", error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
      }
    }

    // ==================== PAYMENT METHODS ====================
    static async getPaymentById(paymentId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/payments/read/${paymentId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching payment:", error.response?.data || error.message);
        throw error;
      }
    }

    static async getAllPayments() {
      try {
        const response = await axios.get(`${API_BASE_URL}/payments/getAll`);
        return response.data;
      } catch (error) {
        console.error("Error fetching payments:", error.response?.data || error.message);
        throw error;
      }
    }

    static async createPayment(paymentData) {
      try {
        const response = await axios.post(`${API_BASE_URL}/payments/create`, paymentData);
        return response.data;
      } catch (error) {
        console.error("Payment creation error:", error.response?.data || error.message);
        throw error;
      }
    }

    // ==================== VEHICLE METHODS ====================
    static async registerVehicle(vehicleData) {
      try {
        if (!vehicleData.applicant || !vehicleData.applicant.userId) {
          throw new Error("User not logged in");
        }
        const response = await axios.post(`${API_BASE_URL}/vehicle/create`, vehicleData);
        return response.data;
      } catch (error) {
        console.error("Vehicle registration error:", error.response || error.message);
        throw error;
      }
    }

    static async createVehicleDisc(discData) {
      try {
        const response = await axios.post(`${API_BASE_URL}/vehicledisc/create`, discData);
        return response.data;
      } catch (error) {
        console.error("Vehicle Disc creation error:", error.response || error.message);
        throw error;
      }
    }

    static async deleteVehicle(vehicleID) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/vehicle/delete/${vehicleID}`);
        return response.data;
      } catch (error) {
        console.error("Error deleting vehicle:", error.response?.data || error.message);
        throw error;
      }
    }

    static async updateVehicle(formData) {
      try {
        const response = await axios.put(`${API_BASE_URL}/vehicle/update`, formData);
        return response.data;
      } catch (error) {
        console.error("Error updating vehicle:", error.response?.data || error.message);
        throw error;
      }
    }

    static async getExpiredVehicles() {
      try {
        const response = await axios.get(`${API_BASE_URL}/vehicle/expired`);
        return response.data;
      } catch (error) {
        console.error("Error fetching expired vehicles:", error.response?.data || error.message);
        throw error;
      }
    }

    static async getExpiredVehiclesByUser(userId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/vehicle/expired/${userId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching expired vehicles by user:", error.response?.data || error.message);
        throw error;
      }
    }

    static async getVehiclesByUser(userId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/vehicle/applicant/${userId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching user's vehicles:", error.response?.data || error.message);
        throw error;
      }
    }

    // ==================== ADMIN METHODS ====================
    static async loginAdmin(email, password) {
      try {
        const response = await axios.post(`${API_BASE_URL}/admins/login`, {
          contact: {email},
          password,
        });
        return response.data;
      } catch (error) {
        console.error("Admin login error:", error.response?.data || error.message);
        throw error;
      }
    }

    static async getAllData() {
      try {
        const response = await axios.get(`${API_BASE_URL}/admins/all-data`);
        return response.data;
      } catch (error) {
        console.error("Error fetching all data:", error.response || error.message);
        throw error;
      }
    }

    static async getAdminById(id) {
      try {
        const response = await axios.get(`${API_BASE_URL}/admins/read/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching admin:", error.response || error.message);
        throw error;
      }
    }

    static async createAdmin(adminData) {
      try {
        const response = await axios.post(`${API_BASE_URL}/admins/create`, adminData);
        return response.data;
      } catch (error) {
        console.error("Error creating admin:", error.response || error.message);
        throw error;
      }
    }

    static async updateAdmin(adminData) {
      try {
        const response = await axios.put(`${API_BASE_URL}/admins/update`, adminData);
        return response.data;
      } catch (error) {
        console.error("Error updating admin:", error.response || error.message);
        throw error;
      }
    }

    static async deleteAdmin(id) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/admins/delete/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error deleting admin:", error.response || error.message);
        throw error;
      }
    }

    static async deleteApplicant(id) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/applicants/delete/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error deleting applicant:", error.response || error.message);
        throw error;
      }
    }

    // ==================== DELETE METHODS ====================
    static async deleteBooking(id) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/bookings/delete/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error deleting booking:", error.response || error.message);
        throw error;
      }
    }

    static async deleteTestAppointment(id) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/test-appointments/delete/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error deleting test appointment:", error.response || error.message);
        throw error;
      }
    }

    static async deleteVehicleDisc(id) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/vehicledisc/delete/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error deleting vehicle disc:", error.response || error.message);
        throw error;
      }
    }

    static async deleteTicket(id) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/tickets/delete/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error deleting ticket:", error.response || error.message);
        throw error;
      }
    }

    // ==================== APPLICANT STATUS ====================
    static async updateApplicantStatus(id, {status, reason}) {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/admins/update-status/${id}`,
          {status, reason}
        );
        return response.data;
      } catch (error) {
        console.error("Error updating applicant status:", error.response || error.message);
        const errorMessage = extractErrorMessage(error);
        throw new Error(errorMessage);
      }
    }

    // ==================== VEHICLE DISCS ====================
    static async getAllVehicleDiscs() {
      try {
        const response = await axios.get(`${API_BASE_URL}/vehicledisc/getAll`);
        return response.data;
      } catch (error) {
        console.error("Error fetching vehicle discs:", error.response || error.message);
        throw error;
      }
    }

    // ==================== TICKET METHODS ====================
    static async getAllTickets() { 
      try {
        const response = await axios.get(`${API_BASE_URL}/tickets/getAll`);
        return response;
      } catch (error) {
        console.error("Error fetching tickets:", error.response?.data || error.message);
        throw error;
      }
    }

    static async updateTicket(ticketData) {
      try {
        return await axios.put(`${API_BASE_URL}/tickets/update`, ticketData);
      } catch (error) {
        console.error("Error updating ticket:", error.response?.data || error.message);
        throw error;
      }
    }

    static async getTicketsByApplicant(userId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/tickets/applicant/${userId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching applicant tickets:", error.response?.data || error.message);
        throw error;
      }
    }

    // ==================== PROFILE METHODS ====================
    static async getUserById(userId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/applicants/read/${userId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching user:", error.response || error.message);
        throw error;
      }
    }

}

export default ApiService;