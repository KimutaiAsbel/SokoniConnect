import React, { useState } from 'react';
import './Login.css';

interface ForgotPasswordProps {
    onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'email' | 'emailSent' | 'newPassword'>('email');
    const [token, setToken] = useState('');
    const [userId, setUserId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmitEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            
            if (response.ok) {
                // Show email sent confirmation
                setMessage('Password reset instructions have been sent to your email. Please check your inbox.');
                
                // Move to the email sent step
                if (data.emailSent) {
                    setStep('emailSent');
                }
            } else {
                setError(data.error || 'Failed to process your request.');
            }
        } catch (error) {
            setError('Network error. Please try again later.');
            console.error('Forgot password error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, userId, newPassword }),
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('Password reset successful! You can now log in with your new password.');
                setTimeout(() => {
                    onBack();
                }, 3000);
            } else {
                setError(data.error || 'Failed to reset password.');
            }
        } catch (error) {
            setError('Network error. Please try again later.');
            console.error('Reset password error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Forgot Password</h2>
                
                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}
                
                {step === 'email' && (
                    <form onSubmit={handleSubmitEmail}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Processing...' : 'Reset Password'}
                        </button>
                        
                        <div className="form-footer">
                            <button type="button" className="text-button" onClick={onBack}>
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}
                
                {step === 'emailSent' && (
                    <div className="email-sent-message">
                        <h3>Email Sent</h3>
                        <div className="email-icon">📧</div>
                        <p>A password reset link has been sent to your email address.</p>
                        <p>Please check your inbox and click on the link to reset your password.</p>
                        <p className="small-text">(For this demo, check server console for the reset link)</p>
                        
                        <div className="form-footer">
                            <button type="button" className="text-button" onClick={() => setStep('email')}>
                                Go Back
                            </button>
                        </div>
                    </div>
                )}
                
                {step === 'newPassword' && (
                    <form onSubmit={handleSubmitReset}>
                        <div className="reset-password-header">
                            <h3>Reset Your Password</h3>
                            <p>Please enter and confirm your new password below</p>
                        </div>
                        
                        <div className="demo-token-section">
                            <p className="small-text">In a real application, you would click on a link from your email that would include the token and userId as URL parameters</p>
                            <div className="form-group">
                                <label htmlFor="mockToken">Reset Token (For demo only)</label>
                                <input
                                    type="text"
                                    id="mockToken"
                                    placeholder="Enter token from server console log"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="mockUserId">User ID (For demo only)</label>
                                <input
                                    type="text"
                                    id="mockUserId"
                                    placeholder="Enter userId from server console log"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Processing...' : 'Update Password'}
                        </button>
                        
                        <div className="form-footer">
                            <button type="button" className="text-button" onClick={onBack}>
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
