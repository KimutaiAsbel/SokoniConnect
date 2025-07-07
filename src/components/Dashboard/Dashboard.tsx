import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import { getCurrentUser, logout } from '../../services/authService';
import MarketAlerts from '../MarketAlerts/MarketAlerts';
import MarketIntelligence from '../MarketIntelligence/MarketIntelligence';
import AttendanceTracking from '../AttendanceTracking/AttendanceTracking';
import Reports from '../Reports/Reports';
import Payment from '../Payment/Payment';
import './Dashboard.css';
import '../Payment/MpesaPayment.css';

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = getCurrentUser();
        const token = authService.getToken();
        console.log('Dashboard - Current user:', currentUser);
        console.log('Dashboard - Current token:', token);
        
        if (!currentUser) {
            navigate('/login');
        } else {
            // Ensure user has the token property for API calls
            const userWithToken = { 
                ...currentUser, 
                token: token 
            };
            setUser(userWithToken);
            console.log('Dashboard - User with token set:', userWithToken);
            
            // For administrator role, set reports as default tab
            if (currentUser.role === 'administrator') {
                setActiveTab('reports');
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    // Determine which tabs the user can access based on role
    const canAccessReports = user.role === 'admin' || user.role === 'administrator';
    const canAccessMarketFeatures = user.role === 'admin' || user.role === 'trader';

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>🏪 Sokoni Connect</h1>
                        <span className="subtitle">Market Management Platform</span>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span>Welcome, {user.username}! <small>({user.role})</small></span>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="dashboard-nav">
                {(user.role === 'admin' || user.role === 'trader') && (
                    <button 
                        className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Overview
                    </button>
                )}
                
                {canAccessMarketFeatures && (
                    <>
                        <button 
                            className={`nav-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('alerts')}
                        >
                            🔔 Market Alerts
                        </button>
                        <button 
                            className={`nav-btn ${activeTab === 'intelligence' ? 'active' : ''}`}
                            onClick={() => setActiveTab('intelligence')}
                        >
                            📈 Market Intelligence
                        </button>
                        <button 
                            className={`nav-btn ${activeTab === 'attendance' ? 'active' : ''}`}
                            onClick={() => setActiveTab('attendance')}
                        >
                            ✅ Attendance Tracking
                        </button>
                        <button 
                            className={`nav-btn ${activeTab === 'payment' ? 'active' : ''}`}
                            onClick={() => setActiveTab('payment')}
                        >
                            💳 Payments
                        </button>
                    </>
                )}
                
                {canAccessReports && (
                    <button 
                        className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        📝 Reports
                    </button>
                )}
            </nav>

            {/* Main Content */}
            <main className="dashboard-content">
                {activeTab === 'overview' && user.role !== 'administrator' && (
                    <div className="overview-section">
                        <h2>Dashboard Overview</h2>
                        <div className="overview-grid">
                            <div className="overview-card">
                                <h3>📅 Upcoming Market Days</h3>
                                <p>Next market day: <strong>Tomorrow (July 4)</strong></p>
                                <p>Location: Kapsabet Market, Nandi</p>
                                <p className="alert-status">✅ Reminder set</p>
                            </div>
                            <div className="overview-card">
                                <h3>📊 Market Performance</h3>
                                <p>Today's attendance: <strong>85 traders</strong></p>
                                <p>Popular products: Tomatoes, Maize</p>
                                <p className="trend positive">📈 +12% from last week</p>
                            </div>
                            <div className="overview-card">
                                <h3>💰 Price Trends</h3>
                                <p>Tomatoes: <strong>800 Ksh/kg</strong></p>
                                <p>Maize: <strong>600 Ksh/kg</strong></p>
                                <p className="trend stable">📊 Stable prices</p>
                            </div>
                            <div className="overview-card">
                                <h3>🎯 Quick Actions</h3>
                                <button className="action-btn" onClick={() => setActiveTab('attendance')}>
                                    Check In Today
                                </button>
                                <button className="action-btn" onClick={() => setActiveTab('intelligence')}>
                                    View Prices
                                </button>
                                <button className="action-btn" onClick={() => setActiveTab('payment')}>
                                    Pay Service Fee
                                </button>
                                {canAccessReports && (
                                    <button className="action-btn" onClick={() => setActiveTab('reports')}>
                                        Generate Reports
                                    </button>
                                )}
                            </div>
                            {user.role === 'trader' && (
                                <div className="overview-card">
                                    <h3>💳 Pay Service Fee</h3>
                                    <p>Pay your market service fees easily via M-Pesa.</p>
                                    <button className="action-btn" onClick={() => setActiveTab('payment')}>
                                        Go to Payments
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'alerts' && canAccessMarketFeatures && <MarketAlerts />}
                {activeTab === 'intelligence' && canAccessMarketFeatures && <MarketIntelligence />}
                {activeTab === 'attendance' && canAccessMarketFeatures && <AttendanceTracking />}
                {activeTab === 'payment' && canAccessMarketFeatures && <Payment token={user.token} userId={user.id} />}
                {activeTab === 'reports' && canAccessReports && <Reports />}
                
                {/* Administrator welcome screen */}
                {user.role === 'administrator' && activeTab !== 'reports' && (
                    <div className="administrator-welcome">
                        <h2>Welcome, Reports Administrator</h2>
                        <p>As a Reports Administrator, you have exclusive access to the Reports & Analytics module.</p>
                        <p>Please use the Reports tab to generate and view market reports.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;