import axios from "axios";

const API_BASE_URL = "http://localhost:8080/capstone";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add user info for debugging
    console.log('API Call:', {
      url: config.url,
      method: config.method,
      user: user,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);


// ✅ Move helper function outside of the ApiService object
function extractErrorMessage(error) {
  if (error.response) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (data.error) return data.error;
    if (data.message) return data.message;
    return JSON.stringify(data);
  } else if (error.request) {
    return "No response from server";
  } else {
    return error.message;
  }
}

class ApiService {

    
    // Create Test Appointment

    // Create a new test appointment
 static async createTestAppointment(appointmentData) {
  try {
    console.log("Sending appointment data:", JSON.stringify(appointmentData, null, 2));
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
      testData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating test result:", error.response?.data || error.message);
    throw error;
  }
}
static async getPaymentById(paymentId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/payments/read/${paymentId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching payment:", error.response?.data || error.message);
        throw error;
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


//=================================== Register a new user=======================================

  // Register user - automatically routes based on email domain
  static async registerUser(userData) {
    try {
      const email = userData.contact.email;
      
      // Determine which endpoint to use based on email domain
      if (email.endsWith('@admin.co.za')) {
        // Register as admin
        const response = await axios.post(`${API_BASE_URL}/admins/create`, userData);
        return response.data;
      } else {
        // Register as applicant
        const response = await axios.post(`${API_BASE_URL}/applicants/create`, userData);
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

    //=================================== Login a user=======================================

   // Unified login - automatically detects user type based on email
  static async loginUser(email, password) {
    try {
      // Determine which endpoint to use based on email domain
      if (email.endsWith('@admin.co.za')) {
        // Login as admin
        const response = await axios.post(`${API_BASE_URL}/admins/login`, {
          contact: { email },
          password
        });
        return response.data;
      } else {
        // Login as applicant
        const response = await axios.post(`${API_BASE_URL}/applicants/login`, {
          contact: { email },
          password
        });
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  //=================================== Vehicle Services=======================================
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


//   // Vehicle endpoints
// static async registerVehicle(vehicleData) { //Vehicle
//   try {
//     if (!vehicleData.applicant || !vehicleData.applicant.userId) {
//       throw new Error("User not logged in");
//     }
//     const response = await axios.post(`${API_BASE_URL}/vehicle/create`, vehicleData);
//     return response.data;
//   } catch (error) {
//     console.error("Vehicle registration error:", error.response || error.message);
//     throw error;
//   }
// }

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
static async updateVehicle(formData) {
    try {
        const response = await axios.put(`${API_BASE_URL}/vehicle/update`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error(
            "Error updating vehicle:",
            error.response?.data || error.message
        );
        throw error;
    }
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
//===================================  fetch vehicles ======================================= 
  // Add this method to match your backend endpoint
  static async getVehiclesByUser(applicantId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/vehicle/applicant/${applicantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  
// ------------------ ADMINS ------------------
// Login admin - updated to match your backend structure

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

    //This is probably draining you


    // ------------------ APPLICANT STATUS ------------------
    static async updateApplicantStatus(id, {status, reason}) {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/admins/update-status/${id}`,
                {status, reason},
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
            return {success: true, data: response.data};
        } catch (error) {
            console.error(
                "Error fetching user bookings:",
                error.response?.data || error.message
            );
            return {success: false, error: error.response?.data || error.message};
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


    // ----------Tickets Functions--------------//

    static async getAllPayments() {
        try {
            const response = await axios.get(`${API_BASE_URL}/payments/getAll`);
            return response.data;
        } catch (error) {
            console.error("Error fetching payments:", error.response?.data || error.message);
            throw error;
        }
    }

    // static async deletePayment(id) {
    //     try {
    //         const response = await axios.delete(`${API_BASE_URL}/payment/delete/${id}`);
    //         return response.data;
    //     } catch (error) {
    //         console.error("Error deleting payment:", error.response || error.message);
    //         throw error;
    //     }
    // }

    static async createPayment(paymentData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/payments/create`, paymentData);
            return response.data;
        } catch (error) {
            console.error("Payment creation error:", error.response?.data || error.message);
            throw error;
        }
    }

    // ----------Tickets Functions--------------//

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
    static async updateTicket(ticketData) {
        try {
            return await axios.put(`${API_BASE_URL}/tickets/update`, ticketData);
        } catch (error) {
            console.error("Error updating ticket:", error.response?.data || error.message);
            throw error;
        }
    }

    // Get all tickets for a specific applicant (all their vehicles)
    static async getTicketsByApplicant(userId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/tickets/applicant/${userId}`);
            return response.data; // Returns only tickets for this user
        } catch (error) {
            console.error("Error fetching applicant tickets:", error.response?.data || error.message);
            throw error;
        }
    }
        static async createLicense(licenseData) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/license/create`,
                licenseData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("License created successfully:", response.data);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("License creation error:", error.response?.data || error.message);
            return { success: false, error: extractErrorMessage(error) };
        }
    }

    static async createLearners(learnersData) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/learners/create`,
                learnersData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Learners created successfully:", response.data);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Learners creation error:", error.response?.data || error.message);
            return { success: false, error: extractErrorMessage(error) };
        }
    }

    // Optional: Methods to get license/learners by user
    static async getLicenseByUser(userId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/license/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching license:", error.response?.data || error.message);
            throw error;
        }
    }

    static async getLearnersByUser(userId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/learners/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching learners:", error.response?.data || error.message);
            throw error;
        }
    }
    


}

export default ApiService;