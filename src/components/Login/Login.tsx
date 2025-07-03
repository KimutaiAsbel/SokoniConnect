import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import './Login.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            if (isRegistering) {
                await authService.register(username, email, password);
                setIsRegistering(false);
                setError('Registration successful! Please log in.');
            } else {
                await authService.login(username, password);
                navigate('/dashboard');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
        }
    };

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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;