import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../images/default-avatar.png";
import SharedLayout from "../sharedPages/SharedLayout";
import ApiService from "../../services/ApiService";

const Profile = ({ userId, user }) => {
  const [profileUser, setProfileUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Home button functionality - same as in SharedLayout
  const handleHomeClick = () => {
    // Navigate to the appropriate home based on user role
    if (user && user.role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/applicant");
    }
  };

  // Fetch user data when component mounts or userId changes
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const data = await ApiService.getUserById(userId);
        setProfileUser(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          idNumber: data.idNumber || "",
          email: data.contact?.email || "",
          cellphone: data.contact?.cellphone || "",
          street: data.address?.street || "",
          city: data.address?.city || "",
          province: data.address?.province || "",
          country: data.address?.country || "",
          birthDate: data.birthDate || "",
        });
        
        // Check localStorage for saved image first, then use server image
        const savedImage = localStorage.getItem(`profileImage_${userId}`);
        if (savedImage) {
          setImagePreview(savedImage);
        } else if (data.profilePicture) {
          setImagePreview(data.profilePicture);
          // Save to localStorage for persistence
          localStorage.setItem(`profileImage_${userId}`, data.profilePicture);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
        setMessage({ text: "Failed to load profile data", type: "danger" });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        setMessage({ text: "Please select an image file", type: "danger" });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: "Image size should be less than 5MB", type: "danger" });
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview and save to localStorage
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        // Save to localStorage for persistence
        localStorage.setItem(`profileImage_${userId}`, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // First upload image if selected
      let profilePictureUrl = profileUser.profilePicture;
      
      if (selectedImage) {
        profilePictureUrl = await uploadImage(selectedImage);
        // Update localStorage with the new image
        if (profilePictureUrl) {
          localStorage.setItem(`profileImage_${userId}`, profilePictureUrl);
        }
      }

      const updatedUser = {
        ...profileUser,
        firstName: formData.firstName,
        lastName: formData.lastName,
        idNumber: formData.idNumber,
        birthDate: formData.birthDate,
        profilePicture: profilePictureUrl,
        contact: { ...profileUser.contact, email: formData.email, cellphone: formData.cellphone },
        address: { ...profileUser.address, street: formData.street, city: formData.city, province: formData.province, country: formData.country },
      };

      const savedUser = await ApiService.updateApplicant(updatedUser);
      setProfileUser(savedUser);
      setSelectedImage(null); // Reset selected image after save
      setMessage({ text: "Profile updated successfully!", type: "success" });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setMessage({ text: "Failed to update profile", type: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate image upload - replace with actual API call in production
  const uploadImage = async (imageFile) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real application, this would be the URL returned from your server
        // For demo purposes, we'll use the data URL and store in localStorage
        if (imagePreview && imagePreview.startsWith('data:')) {
          resolve(imagePreview);
        } else {
          // Fallback to a placeholder URL
          resolve(`https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=0D8ABC&color=fff`);
        }
      }, 1000);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    // Revert to the original profile picture or default avatar
    const originalImage = profileUser.profilePicture || defaultAvatar;
    setImagePreview(originalImage);
    // Update localStorage
    localStorage.setItem(`profileImage_${userId}`, originalImage);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING": return "bg-warning text-dark";
      case "ACCEPTED": return "bg-success";
      case "REJECTED": return "bg-danger";
      default: return "bg-secondary";
    }
  };

  if (!profileUser) {
    return (
      <SharedLayout user={user}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading profile...</p>
          </div>
        </div>
      </SharedLayout>
    );
  }

  const dobString = formData.birthDate ? new Date(formData.birthDate).toLocaleDateString() : "Not provided";

  return (
    <SharedLayout user={user}>
      <div className="container py-4">
        <div className="card mx-auto shadow border-0" style={{ maxWidth: "700px" }}>
          {/* Card Header with Gradient Background and Home Button */}
          <div className="card-header bg-primary text-white py-3 position-relative">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <button 
                  className="btn btn-outline-light btn-sm me-3"
                  onClick={handleHomeClick}
                  title="Go to Home"
                >
                  <i className="fas fa-home me-1"></i> Home
                </button>
                <h3 className="mb-0 d-inline-block">User Profile</h3>
              </div>
              <button 
                className={`btn ${isEditing ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span> Processing...</>
                ) : isEditing ? (
                  <><i className="fas fa-times me-2"></i>Cancel</>
                ) : (
                  <><i className="fas fa-edit me-2"></i>Edit Profile</>
                )}
              </button>
            </div>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`alert alert-${message.type} alert-dismissible fade show m-3 mb-0`} role="alert">
              {message.text}
              <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
            </div>
          )}

          <div className="card-body p-4">
            {/* Profile Header with Image */}
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                <img
                  src={imagePreview || profileUser.profilePicture || defaultAvatar}
                  alt="Profile"
                  className="rounded-circle border border-4 border-white shadow"
                  style={{ width: "150px", height: "150px", objectFit: "cover", cursor: isEditing ? 'pointer' : 'default' }}
                  onClick={isEditing ? triggerFileInput : undefined}
                />
                
                {isEditing && (
                  <>
                    <button 
                      className="position-absolute top-0 end-0 btn btn-sm btn-primary rounded-circle"
                      style={{ width: "30px", height: "30px" }}
                      onClick={triggerFileInput}
                      title="Change photo"
                    >
                      <i className="fas fa-camera"></i>
                    </button>
                    
                    {(imagePreview && imagePreview !== (profileUser.profilePicture || defaultAvatar)) && (
                      <button 
                        className="position-absolute top-0 start-0 btn btn-sm btn-danger rounded-circle"
                        style={{ width: "30px", height: "30px" }}
                        onClick={removeImage}
                        title="Remove photo"
                    >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </>
                )}
                
                <span className={`position-absolute bottom-0 end-0 badge rounded-pill ${getStatusClass(profileUser.status)} p-2`}>
                  {profileUser.status}
                </span>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              
              {isEditing && (
                <div className="mt-2">
                  <small className="text-muted">Click on the image to change your profile photo</small>
                </div>
              )}
              
              <h3 className="mt-3 mb-1 text-dark">{formData.firstName} {formData.lastName}</h3>
              <p className="text-muted">@{profileUser.username || formData.email}</p>
            </div>

            {/* Application Status Alert */}
            {profileUser.status === "REJECTED" && profileUser.reason && (
              <div className="alert alert-warning">
                <strong>Application Status: </strong> Your application was rejected. <br/>
                <strong>Reason: </strong> {profileUser.reason}
              </div>
            )}

            {/* Profile Information Sections */}
            <div className="row">
              {/* Personal Information */}
              <div className="col-md-6">
                <div className="card mb-4 border-0 shadow-sm">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 text-primary">
                      <i className="fas fa-user me-2"></i>Personal Information
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3 row">
                      <label className="col-sm-4 col-form-label fw-semibold text-dark">
                        First Name:
                      </label>
                      <div className="col-sm-8">
                        {isEditing ? (
                          <input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            type="text"
                          />
                        ) : (
                          <span className="form-control-plaintext text-dark">
                            {formData.firstName || "Not provided"}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3 row">
                      <label className="col-sm-4 col-form-label fw-semibold text-dark">
                        Last Name:
                      </label>
                      <div className="col-sm-8">
                        {isEditing ? (
                          <input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            type="text"
                          />
                        ) : (
                          <span className="form-control-plaintext text-dark">
                            {formData.lastName || "Not provided"}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3 row">
                      <label className="col-sm-4 col-form-label fw-semibold text-dark">
                        ID Number:
                      </label>
                      <div className="col-sm-8">
                        {isEditing ? (
                          <input
                            name="idNumber"
                            value={formData.idNumber}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            type="text"
                          />
                        ) : (
                          <span className="form-control-plaintext text-dark">
                            {formData.idNumber || "Not provided"}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3 row">
                      <label className="col-sm-4 col-form-label fw-semibold text-dark">
                        Date of Birth:
                      </label>
                      <div className="col-sm-8">
                        {isEditing ? (
                          <input
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            type="date"
                          />
                        ) : (
                          <span className="form-control-plaintext text-dark">
                            {dobString}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="col-md-6">
                <div className="card mb-4 border-0 shadow-sm">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 text-primary">
                      <i className="fas fa-address-book me-2"></i>Contact Information
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3 row">
                      <label className="col-sm-4 col-form-label fw-semibold text-dark">
                        Email:
                      </label>
                      <div className="col-sm-8">
                        {isEditing ? (
                          <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            type="email"
                          />
                        ) : (
                          <span className="form-control-plaintext text-dark">
                            {formData.email || "Not provided"}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3 row">
                      <label className="col-sm-4 col-form-label fw-semibold text-dark">
                        Cellphone:
                      </label>
                      <div className="col-sm-8">
                        {isEditing ? (
                          <input
                            name="cellphone"
                            value={formData.cellphone}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            type="tel"
                          />
                        ) : (
                          <span className="form-control-plaintext text-dark">
                            {formData.cellphone || "Not provided"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="card mb-4 border-0 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0 text-primary">
                  <i className="fas fa-map-marker-alt me-2"></i>Address Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="row">
                      <label className="col-sm-4 col-form-label fw-semibold text-dark">
                        Street:
                      </label>
                      <div className="col-sm-8">
                        {isEditing ? (
                          <input
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            type="text"
                          />
                        ) : (
                          <span className="form-control-plaintext text-dark">
                            {formData.street || "Not provided"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <div className="row">
                      <label className="col-sm-4 col-form-label fw-semibold text-dark">
                        City:
                      </label>
                      <div className="col-sm-8">
                        {isEditing ? (
                          <input
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            type="text"
                          />
                        ) : (
                          <span className="form-control-plaintext text-dark">
                            {formData.city || "Not provided"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <div className="row">
                      <label className="col-sm-4 col-form-label fw-semibold text-dark">
                        Province:
                      </label>
                      <div className="col-sm-8">
                        {isEditing ? (
                          <input
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            type="text"
                          />
                        ) : (
                          <span className="form-control-plaintext text-dark">
                            {formData.province || "Not provided"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <div className="row">
                      <label className="col-sm-4 col-form-label fw-semibold text-dark">
                        Country:
                      </label>
                      <div className="col-sm-8">
                        {isEditing ? (
                          <input
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            type="text"
                          />
                        ) : (
                          <span className="form-control-plaintext text-dark">
                            {formData.country || "Not provided"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="text-center mt-4">
                <button 
                  className="btn btn-primary px-4 py-2" 
                  onClick={handleSave} 
                  disabled={isLoading}
                  style={{ borderRadius: '20px' }}
                >
                  {isLoading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span> Saving...</>
                  ) : (
                    <><i className="fas fa-save me-2"></i>Save Changes</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SharedLayout>
  );
};

export default Profile;