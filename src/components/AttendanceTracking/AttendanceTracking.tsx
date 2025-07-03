import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../../services/authService';
import './AttendanceTracking.css';

interface AttendanceRecord {
    id: string;
    userId: string;
    userName: string;
    marketName: string;
    checkInTime: string;
    checkOutTime?: string;
    date: string;
    status: 'checked-in' | 'checked-out';
}

interface MarketOption {
    id: string;
    name: string;
    location: string;
}

const AttendanceTracking: React.FC = () => {
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
    const [selectedMarket, setSelectedMarket] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);

    const markets: MarketOption[] = [
        { id: '1', name: 'Kimara Market', location: 'Kimara, Dar es Salaam' },
        { id: '2', name: 'Kariakoo Market', location: 'Kariakoo, Dar es Salaam' },
        { id: '3', name: 'Tandika Market', location: 'Tandika, Dar es Salaam' },
        { id: '4', name: 'Temeke Market', location: 'Temeke, Dar es Salaam' },
    ];

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);

        // Load existing attendance records from localStorage
        const savedRecords = localStorage.getItem('attendanceRecords');
        if (savedRecords) {
            const records = JSON.parse(savedRecords);
            setAttendanceRecords(records);
            
            // Check if user has already checked in today
            const today = new Date().toISOString().split('T')[0];
            const todayRecord = records.find((record: AttendanceRecord) => 
                record.userId === currentUser?.id && 
                record.date === today && 
                record.status === 'checked-in'
            );
            setTodayRecord(todayRecord || null);
        }

        // Set default market if user has a previous record
        if (attendanceRecords.length > 0 && currentUser) {
            const lastRecord = attendanceRecords
                .filter(record => record.userId === currentUser.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            if (lastRecord) {
                const market = markets.find(m => m.name === lastRecord.marketName);
                if (market) {
                    setSelectedMarket(market.id);
                }
            }
        }
    }, []);

    const handleCheckIn = async () => {
        if (!selectedMarket || !user) return;

        setLoading(true);
        const market = markets.find(m => m.id === selectedMarket);
        if (!market) return;

        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        
        const newRecord: AttendanceRecord = {
            id: Date.now().toString(),
            userId: user.id,
            userName: user.username,
            marketName: market.name,
            checkInTime: now.toLocaleTimeString(),
            date: today,
            status: 'checked-in'
        };

        const updatedRecords = [...attendanceRecords, newRecord];
        setAttendanceRecords(updatedRecords);
        setTodayRecord(newRecord);
        localStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));
        setLoading(false);
    };

    const handleCheckOut = async () => {
        if (!todayRecord || !user) return;

        setLoading(true);
        const now = new Date();
        
        const updatedRecords = attendanceRecords.map(record => 
            record.id === todayRecord.id 
                ? { ...record, checkOutTime: now.toLocaleTimeString(), status: 'checked-out' as const }
                : record
        );

        setAttendanceRecords(updatedRecords);
        setTodayRecord(null);
        localStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));
        setLoading(false);
    };

    const getUserAttendanceHistory = () => {
        if (!user) return [];
        return attendanceRecords
            .filter(record => record.userId === user.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10); // Show last 10 records
    };

    const getTodayStats = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = attendanceRecords.filter(record => record.date === today);
        
        const marketStats: { [key: string]: number } = {};
        todayRecords.forEach(record => {
            marketStats[record.marketName] = (marketStats[record.marketName] || 0) + 1;
        });

        return {
            total: todayRecords.length,
            markets: Object.entries(marketStats).map(([market, count]) => ({ market, count }))
        };
    };

    const stats = getTodayStats();
    const userHistory = getUserAttendanceHistory();

    return (
        <div className="attendance-tracking">
            <div className="attendance-header">
                <h2>Digital Attendance Tracking</h2>
                <p>Track your market attendance and view insights across different markets</p>
            </div>

            <div className="check-in-section">
                <div className="check-in-card">
                    <h3>Today's Attendance</h3>
                    
                    {!todayRecord ? (
                        <div className="check-in-form">
                            <div className="form-group">
                                <label htmlFor="market-select">Select Market:</label>
                                <select 
                                    id="market-select"
                                    value={selectedMarket} 
                                    onChange={(e) => setSelectedMarket(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Choose a market...</option>
                                    {markets.map(market => (
                                        <option key={market.id} value={market.id}>
                                            {market.name} - {market.location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <button 
                                className="check-in-btn"
                                onClick={handleCheckIn}
                                disabled={!selectedMarket || loading}
                            >
                                {loading ? 'Checking In...' : '✅ Check In'}
                            </button>
                        </div>
                    ) : (
                        <div className="checked-in-status">
                            <div className="status-info">
                                <h4>✅ Checked In</h4>
                                <p><strong>Market:</strong> {todayRecord.marketName}</p>
                                <p><strong>Time:</strong> {todayRecord.checkInTime}</p>
                                <p><strong>Date:</strong> {new Date(todayRecord.date).toLocaleDateString()}</p>
                            </div>
                            
                            <button 
                                className="check-out-btn"
                                onClick={handleCheckOut}
                                disabled={loading}
                            >
                                {loading ? 'Checking Out...' : '🚪 Check Out'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="today-stats">
                    <h3>Today's Market Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-number">{stats.total}</span>
                            <span className="stat-label">Total Traders</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{stats.markets.length}</span>
                            <span className="stat-label">Active Markets</span>
                        </div>
                    </div>
                    
                    {stats.markets.length > 0 && (
                        <div className="market-breakdown">
                            <h4>Market Breakdown</h4>
                            {stats.markets.map(({ market, count }) => (
                                <div key={market} className="market-stat">
                                    <span className="market-name">{market}</span>
                                    <span className="trader-count">{count} traders</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="attendance-history">
                <h3>Your Attendance History</h3>
                {userHistory.length > 0 ? (
                    <div className="history-list">
                        {userHistory.map(record => (
                            <div key={record.id} className="history-item">
                                <div className="history-main">
                                    <div className="history-info">
                                        <h4>{record.marketName}</h4>
                                        <p className="history-date">{new Date(record.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="history-times">
                                        <span className="check-in-time">
                                            ✅ In: {record.checkInTime}
                                        </span>
                                        {record.checkOutTime && (
                                            <span className="check-out-time">
                                                🚪 Out: {record.checkOutTime}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="status-badge">
                                    <span className={`badge ${record.status}`}>
                                        {record.status === 'checked-in' ? 'Active' : 'Completed'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-history">
                        <p>No attendance history yet. Check in to your first market!</p>
                    </div>
                )}
            </div>

            <div className="insights-section">
                <h3>Attendance Insights</h3>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h4>Most Visited Market</h4>
                        <p>{userHistory.length > 0 ? 
                            userHistory.reduce((prev, current) => 
                                userHistory.filter(r => r.marketName === current.marketName).length > 
                                userHistory.filter(r => r.marketName === prev.marketName).length ? current : prev
                            ).marketName : 'N/A'
                        }</p>
                    </div>
                    <div className="insight-card">
                        <h4>Total Market Days</h4>
                        <p>{userHistory.length}</p>
                    </div>
                    <div className="insight-card">
                        <h4>This Month</h4>
                        <p>{userHistory.filter(record => {
                            const recordDate = new Date(record.date);
                            const now = new Date();
                            return recordDate.getMonth() === now.getMonth() && 
                                   recordDate.getFullYear() === now.getFullYear();
                        }).length} days</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceTracking;