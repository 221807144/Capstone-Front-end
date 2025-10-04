import axios from "axios";

const API_BASE_URL = "http://localhost:8080/capstone";


class ApiService {
  // Create Test Appointment

  // Create a new test appointment
   static async createTestAppointment(appointmentData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/test-appointments/create`,
        appointmentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Appointment created successfully:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "Booking creation error:",
        error.response?.data || error.message
      );
      const errorMessage = this.extractErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }
//Profile
  static async getUserById(userId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/applicants/read/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error.response || error.message);
    throw error;
  }
}

static async updateApplicant(applicantData) {
  try {
    const response = await axios.put(`${API_BASE_URL}/applicants/update`, applicantData);
    return response.data;
  } catch (error) {
    console.error("Error updating applicant:", error.response?.data || error.message);
    throw error;
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
  static async loginUser(email, password) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/applicants/login`,
            {
                contact: { email: email },
                password: password,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                }
            }
        );

        // Check the response structure
        console.log("Login response:", response); // Debug log
        
        // If response is a string (error message), throw it
        if (typeof response.data === 'string') {
            throw new Error(response.data);
        }
        
        // If response is an object with data property (common in Spring)
        if (response.data && response.data.data) {
            return response.data.data;
        }
        
        // If response is the applicant object directly
        if (response.data && response.data.firstName) {
            return response.data;
        }
        
        // If none of the above, throw error
        throw new Error("Invalid response format from server");

    } catch (error) {
        // Extract error message from various possible response formats
        let errorMessage = "Login failed. Please check your credentials.";
        
        if (error.response) {
            // Server responded with error status
            if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.response.data.error) {
                errorMessage = error.response.data.error;
            } else if (error.response.data.data) {
                errorMessage = error.response.data.data;
            }
        } else if (error.request) {
            errorMessage = "No response from server. Please try again later.";
        } else {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
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


  

  // delete vehicle dashboard
  // Delete a vehicle by ID
static async deleteVehicle(vehicleID) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/vehicle/delete/${vehicleID}`);
    return response.data; // "Vehicle deleted successfully"
  } catch (error) {
    console.error("Error deleting vehicle:", error.response?.data || error.message);
    throw error;
  }
}

// update vehicle
// In ApiService.js
static async updateVehicle(formData) {
  const response = await axios.put(
    `${API_BASE_URL}/vehicle/update`,
    formData,
    {
      headers: { 
        "Content-Type": "multipart/form-data",
        // Add authorization header if needed
        // "Authorization": `Bearer ${yourToken}`
      }
    }
  );
  return response.data;
}



// // Fetch all expired vehicles (not per user)
static async getExpiredVehicles() {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicle/expired`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expired vehicles:", error.response?.data || error.message);
    throw error;
  }
}
// made chnages
// ✅ Correct
static async getExpiredVehiclesByUser(userId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicle/expired/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expired vehicles by user:", error.response?.data || error.message);
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
    const response = await axios.get(`${API_BASE_URL}/vehicle/applicant/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user's vehicles:", error.response?.data || error.message);
    throw error;
  }
}




  // ------------------ APPLICANT STATUS ------------------
   static async updateApplicantStatus(id, { status, reason }) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admins/update-status/${id}`,
        { status, reason },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating applicant status:", error.response || error.message);
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  }
    static async getUserBookings(userId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/test-appointments/by-applicant/${userId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "Error fetching user bookings:",
        error.response?.data || error.message
      );
      return { success: false, error: error.response?.data || error.message };
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


// Payment functions

static async getAllPayments() {
       try {
           const response = await axios.get(`${API_BASE_URL}/payments/getAll`);
           return response.data;
       } catch (error) {
           console.error("Error fetching payments:", error.response?.data || error.message);
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

static async createPayment(paymentData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/create`, paymentData);
      return response.data;
    } catch (error) {
      console.error("Payment creation error:", error.response?.data || error.message);
      throw error;
    }
  }

  // Tickets Functions

  // Get all tickets
static async getAllTickets() {
  try {
    const response = await axios.get(`${API_BASE_URL}/tickets/getAll`);
    return response;
  } catch (error) {
    console.error("Error fetching tickets:", error.response?.data || error.message);
    throw error;
  }
}

// Update a ticket
static async updateTicket(id, ticketData) {
  try {
    const response = await axios.put(`${API_BASE_URL}/tickets/update`, ticketData);
    return response;
  } catch (error) {
    console.error("Error updating ticket:", error.response?.data || error.message);
    throw error;
  }
}
// In ApiService.js - UPDATE THESE METHODS:

static async deleteApplicant(id) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admins/applicants/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting applicant:", error.response || error.message);
    throw error;
  }
}

static async deleteBooking(id) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admins/bookings/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting booking:", error.response || error.message);
    throw error;
  }
}

static async deletePayment(id) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admins/payments/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting payment:", error.response || error.message);
    throw error;
  }
}

static async deleteTestAppointment(id) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admins/test-appointments/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting test appointment:", error.response || error.message);
    throw error;
  }
}

static async deleteVehicleDisc(id) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admins/vehicle-discs/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting vehicle disc:", error.response || error.message);
    throw error;
  }
}

static async deleteTicket(id) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admins/tickets/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting ticket:", error.response || error.message);
    throw error;
  }
}

}

export default ApiService;