import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';
import MarketAlerts from '../MarketAlerts/MarketAlerts';
import MarketIntelligence from '../MarketIntelligence/MarketIntelligence';
import AttendanceTracking from '../AttendanceTracking/AttendanceTracking';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate('/login');
        } else {
            setUser(currentUser);
        }
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return <div>Loading...</div>;
    }

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
                            <span>Welcome, {user.username}!</span>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="dashboard-nav">
                <button 
                    className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
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
            </nav>

            {/* Main Content */}
            <main className="dashboard-content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <h2>Dashboard Overview</h2>
                        <div className="overview-grid">
                            <div className="overview-card">
                                <h3>📅 Upcoming Market Days</h3>
                                <p>Next market day: <strong>Tomorrow (July 4)</strong></p>
                                <p>Location: Kimara Market</p>
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
                                <p>Tomatoes: <strong>800 TSh/kg</strong></p>
                                <p>Maize: <strong>600 TSh/kg</strong></p>
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
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'alerts' && <MarketAlerts />}
                {activeTab === 'intelligence' && <MarketIntelligence />}
                {activeTab === 'attendance' && <AttendanceTracking />}
            </main>
        </div>
    );
};

export default Dashboard;