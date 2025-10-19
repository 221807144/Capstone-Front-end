import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import SharedLayout from '../sharedPages/SharedLayout'; // Import SharedLayout

const ChangePassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email verification, 2: Password change
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Step 1: Email Verification
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email address');
      setEmailLoading(false);
      return;
    }

    try {
      console.log('🔄 Verifying email for password reset:', email);
      const result = await ApiService.verifyEmailForPasswordReset(email);
      console.log('📧 Email verification response:', result);
      
      if (result.success) {
        setMessage('Email verified successfully! You can now set your new password.');
        setStep(2); // Move directly to password change step
      } else {
        setError(result.message || 'Email not found in our system');
      }
    } catch (err) {
      console.error('❌ Email verification error:', err);
      setError(`Failed to verify email: ${err.message || 'Please try again'}`);
    } finally {
      setEmailLoading(false);
    }
  };

  // Step 2: Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Sending password reset request:', { email, newPassword: formData.newPassword });
      const result = await ApiService.resetPassword(email, formData.newPassword);
      console.log('🔑 Password reset response:', result);

      if (result.success) {
        setMessage('Password changed successfully! You can now login with your new password.');
        setFormData({
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(result.message || 'Failed to change password. Please try again.');
      }
    } catch (err) {
      console.error('❌ Password change error:', err);
      setError(`Error changing password: ${err.message || 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage('');
    setError('');
  };

  const resetForm = () => {
    setStep(1);
    setEmail('');
    setFormData({ newPassword: '', confirmPassword: '' });
    setMessage('');
    setError('');
  };

  // Get current user from localStorage for SharedLayout
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <SharedLayout user={currentUser}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.title}>Change Password</h2>
            <div style={styles.stepIndicator}>
              <div style={styles.steps}>
                <div style={{...styles.step, ...(step >= 1 ? styles.stepActive : {})}}>
                  <div style={styles.stepNumber}>1</div>
                  <span style={styles.stepText}>Verify Email</span>
                </div>
                <div style={styles.stepLine}></div>
                <div style={{...styles.step, ...(step >= 2 ? styles.stepActive : {})}}>
                  <div style={styles.stepNumber}>2</div>
                  <span style={styles.stepText}>New Password</span>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.cardBody}>
            {message && (
              <div style={styles.alertSuccess}>
                <div style={styles.alertContent}>
                  <span style={styles.alertIcon}>✓</span>
                  {message}
                </div>
                <button 
                  type="button" 
                  style={styles.alertClose}
                  onClick={() => setMessage('')}
                >
                  ×
                </button>
                
                {/* Show login button after successful password change */}
                {message.includes('successfully') && (
                  <div style={styles.successActions}>
                    <button 
                      style={styles.loginButton}
                      onClick={() => navigate('/login')}
                    >
                      Go to Login
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {error && (
              <div style={styles.alertError}>
                <div style={styles.alertContent}>
                  <span style={styles.alertIcon}>⚠</span>
                  {error}
                </div>
                <button 
                  type="button" 
                  style={styles.alertClose}
                  onClick={() => setError('')}
                >
                  ×
                </button>
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label htmlFor="email" style={styles.label}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    style={styles.input}
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={emailLoading}
                    placeholder="Enter your registered email"
                  />
                  <div style={styles.helpText}>
                    We'll verify your email and then you can set a new password.
                  </div>
                </div>

                <div style={styles.buttonGroup}>
                  <button
                    type="submit"
                    style={emailLoading ? styles.buttonPrimaryDisabled : styles.buttonPrimary}
                    disabled={emailLoading}
                  >
                    {emailLoading ? (
                      <>
                        <span style={styles.spinner}></span>
                        Verifying Email...
                      </>
                    ) : (
                      'Verify Email'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    style={styles.buttonSecondary}
                    onClick={() => navigate(-1)}
                    disabled={emailLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Password Change */}
            {step === 2 && (
              <form onSubmit={handlePasswordSubmit} style={styles.form}>
                <div style={styles.verifiedEmail}>
                  <span style={styles.verifiedIcon}>✓</span>
                  Email verified: <strong>{email}</strong>
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="newPassword" style={styles.label}>
                    New Password
                  </label>
                  <input
                    type="password"
                    style={styles.input}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                    disabled={loading}
                    placeholder="Enter your new password"
                  />
                  <div style={styles.helpText}>
                    Password must be at least 6 characters long.
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="confirmPassword" style={styles.label}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    style={styles.input}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="Confirm your new password"
                  />
                </div>

                <div style={styles.buttonGroup}>
                  <button
                    type="submit"
                    style={loading ? styles.buttonPrimaryDisabled : styles.buttonPrimary}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span style={styles.spinner}></span>
                        Changing Password...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                  
                  <div style={styles.secondaryButtons}>
                    <button
                      type="button"
                      style={styles.buttonSecondary}
                      onClick={() => {
                        setStep(1);
                        setFormData({ newPassword: '', confirmPassword: '' });
                      }}
                      disabled={loading}
                    >
                      Back to Email
                    </button>
                    
                    <button
                      type="button"
                      style={styles.buttonOutline}
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </SharedLayout>
  );
};

const styles = {
  container: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '480px',
    overflow: 'hidden',
  },
  cardHeader: {
    background: 'linear-gradient(135deg, #1a3a5f 0%, #2c5282 100%)',
    color: 'white',
    padding: '2rem',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.75rem',
    fontWeight: '600',
  },
  stepIndicator: {
    display: 'flex',
    justifyContent: 'center',
  },
  steps: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    opacity: 0.6,
    transition: 'all 0.3s ease',
  },
  stepActive: {
    opacity: 1,
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  stepText: {
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  stepLine: {
    width: '60px',
    height: '2px',
    background: 'rgba(255, 255, 255, 0.3)',
  },
  cardBody: {
    padding: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.25rem',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  inputFocus: {
    borderColor: '#1a3a5f',
    boxShadow: '0 0 0 3px rgba(26, 58, 95, 0.1)',
  },
  helpText: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  verifiedEmail: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    color: '#0369a1',
    fontSize: '0.875rem',
  },
  verifiedIcon: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #1a3a5f 0%, #2c5282 100%)',
    color: 'white',
    border: 'none',
    padding: '0.875rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  buttonPrimaryDisabled: {
    background: '#9ca3af',
    color: 'white',
    border: 'none',
    padding: '0.875rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    opacity: 0.7,
  },
  buttonSecondary: {
    background: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '0.875rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonOutline: {
    background: 'transparent',
    color: '#ef4444',
    border: '2px solid #ef4444',
    padding: '0.875rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  secondaryButtons: {
    display: 'flex',
    gap: '0.75rem',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid currentColor',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  alertSuccess: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
    padding: '1rem',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    position: 'relative',
  },
  alertError: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '1rem',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    position: 'relative',
  },
  alertContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  alertIcon: {
    fontSize: '1.125rem',
    flexShrink: 0,
  },
  alertClose: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    color: 'inherit',
    cursor: 'pointer',
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successActions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '0.5rem',
  },
  loginButton: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default ChangePassword;