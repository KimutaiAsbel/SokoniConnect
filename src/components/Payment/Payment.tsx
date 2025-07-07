import React, { useState, useEffect } from 'react';
import MpesaPayment from './MpesaPayment';
import { getPaymentHistory } from '../../services/mpesaService';
import './MpesaPayment.css';

interface PaymentProps {
    token: string;
    userId: number;
}

const Payment: React.FC<PaymentProps> = ({ token, userId }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            console.log('Fetching payment history with token:', token);
            try {
                const data = await getPaymentHistory(token);
                console.log('Payment history response:', data);
                setHistory(Array.isArray(data) ? data : []);
                setError('');
            } catch (err) {
                console.error('Error fetching payment history:', err);
                setError('Failed to load payment history.');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchHistory();
        } else {
            console.error('No token available for payment history fetch');
            setError('Authentication error. Please log in again.');
        }
    }, [token, refreshTrigger]);

    const handlePaymentSuccess = () => {
        // Refresh payment history after successful payment
        setRefreshTrigger(prev => prev + 1);
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-KE', options);
    };

    // Format status with color
    const getStatusBadge = (status: string) => {
        let className = 'status-badge ';
        
        switch (status) {
            case 'completed':
                className += 'status-success';
                break;
            case 'pending':
                className += 'status-pending';
                break;
            case 'failed':
                className += 'status-failed';
                break;
            default:
                className += 'status-default';
        }
        
        return <span className={className}>{status}</span>;
    };

    return (
        <div className="payment-page">
            <h1>Service Fee Payment</h1>
            
            <div className="payment-container">
                <div className="payment-section">
                    <h2>Pay via M-Pesa</h2>
                    <MpesaPayment 
                        token={token}
                        userId={userId}
                        defaultAmount={100}
                        onSuccess={handlePaymentSuccess}
                    />
                </div>
                
                <div className="payment-history-section">
                    <h2>Payment History</h2>
                    {loading && <p>Loading payment history...</p>}
                    {error && <p className="error">{error}</p>}
                    
                    {!loading && history.length === 0 && (
                        <p>No payment records found.</p>
                    )}
                    
                    {!loading && history.length > 0 && (
                        <div className="payment-history-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Reference</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>{formatDate(payment.created_at)}</td>
                                            <td>Ksh {payment.amount}</td>
                                            <td>{payment.reference}</td>
                                            <td>{getStatusBadge(payment.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Payment;
