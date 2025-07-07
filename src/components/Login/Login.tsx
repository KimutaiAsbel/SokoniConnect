import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import ForgotPassword from './ForgotPassword';
import './Login.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            console.log('Login form submitted');
            
            if (isRegistering) {
                console.log('Attempting to register user:', username);
                await authService.register(username, email, password);
                setIsRegistering(false);
                setError('Registration successful! Please log in.');
            } else {
                console.log('Attempting to login user:', username);
                const result = await authService.login(username, password);
                console.log('Login result:', result);
                
                if (result && result.token) {
                    console.log('Login successful, navigating to dashboard');
                    navigate('/dashboard');
                } else {
                    console.error('Login succeeded but no token returned');
                    setError('Authentication failed. Please try again.');
                }
            }
        } catch (err) {
            console.error('Login/Register component error:', err);
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Handle forgot password view
    if (isForgotPassword) {
        return <ForgotPassword onBack={() => setIsForgotPassword(false)} />;
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>🏪 Sokoni Connect</h1>
                    <p>Connecting Local Markets Digitally</p>
                </div>
                
                <div className="login-form-container">
                    <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
                    {error && <div className={`message ${error.includes('successful') ? 'success' : 'error'}`}>{error}</div>}
                    
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        
                        {isRegistering && (
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                            {!isRegistering && (
                                <div className="forgot-password">
                                    <button 
                                        type="button" 
                                        className="text-button"
                                        onClick={() => setIsForgotPassword(true)}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <button type="submit" className="login-btn">
                            {isRegistering ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>
                    
                    <div className="toggle-form">
                        <p>
                            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button 
                                type="button" 
                                className="toggle-btn"
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setError('');
                                }}
                            >
                                {isRegistering ? 'Sign In' : 'Create Account'}
                            </button>
                        </p>
                    </div>
                    
                    <div className="demo-info">
                        <p><strong>Demo Credentials:</strong></p>
                        <p>Username: demo | Password: password</p>
                        <p>Username: admin | Password: admin123 (Admin role)</p>
                        <p>Username: trader | Password: trader123 (Trader role)</p>
                        <p>Username: reports | Password: reports123 (Reports Admin role)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;