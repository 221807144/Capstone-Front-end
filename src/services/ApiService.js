import axios from "axios";

const API_BASE_URL = "http://localhost:8080/capstone";

class ApiService {
  // Create Test Appointment

  // Create a new test appointment
  static async createTestAppointment(appointmentData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/test-appointments/create`,
        appointmentData
      );
      console.log("Appointment created successfully:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Booking creation error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  
  // Register a new user

  // Register a new applicant
static async registerUser(userData) {
  try {
    const url =
      userData.role === "ADMIN"
        ? `${API_BASE_URL}/admins/create`
        : `${API_BASE_URL}/applicants/create`;

    const response = await axios.post(url, userData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response || error.message);
    throw error;
  }
}
  // Login user
    // Login user
  static async loginUser(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/applicants/login`, {
        contact: { email },
        password,
      });
      return response.data;
    } catch (error) {
      console.error("Login error:", error.response || error.message);
      throw error;
    }
  }

  // Vehicle endpoints
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

  // Payment method
  static async createPayment(paymentData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/create`, paymentData);
      return response.data;
    } catch (error) {
      console.error("Payment creation error:", error.response?.data || error.message);
      throw error;
    }
  }

// ------------------ ADMINS ------------------
// Login admin - updated to match your backend structure
static async loginAdmin(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/admins/login`, {
      contact: { email },
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

  // ------------------ DELETE METHODS ------------------
  static async deleteBooking(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/bookings/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting booking:", error.response || error.message);
      throw error;
    }
  }

  static async deletePayment(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/payment/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting payment:", error.response || error.message);
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

  // Fetch vehicles for a specific user
static async getVehiclesByUser(userId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicle/user/${userId}`);
    // console.log("Fetched user vehicles:", userVehicles);

    return response.data;
  } catch (error) {
    console.error("Error fetching user's vehicles:", error.response?.data || error.message);
    throw error;
  }
}
// Fetch expired vehicle discs for a specific user
static async getExpiredVehiclesByUser(userId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicle/expired/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expired vehicles:", error.response?.data || error.message);
    throw error;
  }
}



  // ------------------ APPLICANT STATUS ------------------
  static async updateApplicantStatus(id, { status, reason }) {
    try {
      const response = await axios.put(`${API_BASE_URL}/applicants/update-status/${id}`, { status, reason });
      return response.data;
    } catch (error) {
      console.error("Error updating applicant status:", error.response || error.message);
      throw error;
    }
  }
  // Fetch all vehicle discs
static async getAllVehicleDiscs() {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicledisc/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vehicle discs:", error.response || error.message);
    throw error;
  }
}
// src/services/ApiService.js

// Fetch expired vehicles from backend
static async getExpiredVehicles() {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicle/expired`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expired vehicles:", error.response || error.message);
    throw error;
  }
}

}


export default ApiService;
