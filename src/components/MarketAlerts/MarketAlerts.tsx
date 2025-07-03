import React, { useState, useEffect } from 'react';
import './MarketAlerts.css';

interface MarketAlert {
    id: string;
    marketName: string;
    date: string;
    time: string;
    location: string;
    type: 'reminder' | 'important' | 'weather';
    message: string;
    isEnabled: boolean;
}

const MarketAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<MarketAlert[]>([
        {
            id: '1',
            marketName: 'Kimara Market',
            date: '2025-07-04',
            time: '06:00',
            location: 'Kimara, Dar es Salaam',
            type: 'reminder',
            message: 'Market day tomorrow at Kimara Market. Set up starts at 6:00 AM.',
            isEnabled: true
        },
        {
            id: '2',
            marketName: 'Kariakoo Market',
            date: '2025-07-06',
            time: '05:30',
            location: 'Kariakoo, Dar es Salaam',
            type: 'important',
            message: 'Special wholesale market this Sunday. Early setup recommended.',
            isEnabled: true
        },
        {
            id: '3',
            marketName: 'Tandika Market',
            date: '2025-07-05',
            time: '06:30',
            location: 'Tandika, Dar es Salaam',
            type: 'weather',
            message: 'Weather alert: Light rain expected. Bring waterproof covers.',
            isEnabled: true
        }
    ]);

    const [newAlert, setNewAlert] = useState({
        marketName: '',
        date: '',
        time: '',
        location: '',
        type: 'reminder' as const
    });

    const [showAddForm, setShowAddForm] = useState(false);

    const addAlert = () => {
        if (newAlert.marketName && newAlert.date && newAlert.time) {
            const alert: MarketAlert = {
                id: Date.now().toString(),
                ...newAlert,
                message: `Market day at ${newAlert.marketName} on ${new Date(newAlert.date).toLocaleDateString()} at ${newAlert.time}.`,
                isEnabled: true
            };
            setAlerts([...alerts, alert]);
            setNewAlert({
                marketName: '',
                date: '',
                time: '',
                location: '',
                type: 'reminder'
            });
            setShowAddForm(false);
        }
    };

    const toggleAlert = (id: string) => {
        setAlerts(alerts.map(alert => 
            alert.id === id ? { ...alert, isEnabled: !alert.isEnabled } : alert
        ));
    };

    const deleteAlert = (id: string) => {
        setAlerts(alerts.filter(alert => alert.id !== id));
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'reminder': return '🔔';
            case 'important': return '⚠️';
            case 'weather': return '🌦️';
            default: return '📢';
        }
    };

    const getAlertClass = (type: string) => {
        switch (type) {
            case 'important': return 'alert-important';
            case 'weather': return 'alert-weather';
            default: return 'alert-reminder';
        }
    };

    return (
        <div className="market-alerts">
            <div className="alerts-header">
                <h2>Market Day Alerts</h2>
                <p>Stay informed about upcoming market days and important announcements</p>
                <button 
                    className="add-alert-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    + Add New Alert
                </button>
            </div>

            {showAddForm && (
                <div className="add-alert-form">
                    <h3>Add New Market Alert</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Market Name</label>
                            <input
                                type="text"
                                value={newAlert.marketName}
                                onChange={(e) => setNewAlert({...newAlert, marketName: e.target.value})}
                                placeholder="e.g., Kimara Market"
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={newAlert.date}
                                onChange={(e) => setNewAlert({...newAlert, date: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Time</label>
                            <input
                                type="time"
                                value={newAlert.time}
                                onChange={(e) => setNewAlert({...newAlert, time: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                value={newAlert.location}
                                onChange={(e) => setNewAlert({...newAlert, location: e.target.value})}
                                placeholder="e.g., Kimara, Dar es Salaam"
                            />
                        </div>
                        <div className="form-group">
                            <label>Alert Type</label>
                            <select
                                value={newAlert.type}
                                onChange={(e) => setNewAlert({...newAlert, type: e.target.value as any})}
                            >
                                <option value="reminder">Regular Reminder</option>
                                <option value="important">Important Notice</option>
                                <option value="weather">Weather Alert</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button onClick={addAlert} className="save-btn">Save Alert</button>
                        <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
                    </div>
                </div>
            )}

            <div className="alerts-grid">
                {alerts.map(alert => (
                    <div key={alert.id} className={`alert-card ${getAlertClass(alert.type)}`}>
                        <div className="alert-header">
                            <div className="alert-icon">{getAlertIcon(alert.type)}</div>
                            <div className="alert-title">
                                <h3>{alert.marketName}</h3>
                                <span className="alert-date">
                                    {new Date(alert.date).toLocaleDateString()} at {alert.time}
                                </span>
                            </div>
                            <div className="alert-controls">
                                <button
                                    className={`toggle-btn ${alert.isEnabled ? 'enabled' : 'disabled'}`}
                                    onClick={() => toggleAlert(alert.id)}
                                >
                                    {alert.isEnabled ? '🔔' : '🔕'}
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteAlert(alert.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div className="alert-content">
                            <p className="alert-location">📍 {alert.location}</p>
                            <p className="alert-message">{alert.message}</p>
                            <div className="alert-status">
                                Status: {alert.isEnabled ? 
                                    <span className="status-enabled">Active</span> : 
                                    <span className="status-disabled">Disabled</span>
                                }
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {alerts.length === 0 && (
                <div className="no-alerts">
                    <p>No alerts set up yet. Add your first market day alert!</p>
                </div>
            )}
        </div>
    );
};

export default MarketAlerts;