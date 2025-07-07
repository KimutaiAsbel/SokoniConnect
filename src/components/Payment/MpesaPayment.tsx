import React, { useState } from 'react';
import { initiateMpesaPayment, checkMpesaPaymentStatus } from '../../services/mpesaService';

interface MpesaPaymentProps {
    token: string;
    userId: number;
    defaultAmount?: number;
    onSuccess?: () => void;
}

const MpesaPayment: React.FC<MpesaPaymentProps> = ({ token, userId, defaultAmount = 100, onSuccess }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState(defaultAmount);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkoutRequestId, setCheckoutRequestId] = useState('');
    const [polling, setPolling] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');
        setCheckoutRequestId('');
        
        console.log('MpesaPayment - Submitting payment with token:', token);
        console.log('MpesaPayment - Phone number:', phoneNumber);
        console.log('MpesaPayment - Amount:', amount);
        
        try {
            const response = await initiateMpesaPayment(token, phoneNumber, amount);
            console.log('MpesaPayment - Response from API:', response);
            
            if (response.checkoutRequestId) {
                setCheckoutRequestId(response.checkoutRequestId);
                setStatus('Payment initiated. Please enter your M-Pesa PIN on your phone.');
                setPolling(true);
                pollStatus(response.checkoutRequestId);
            } else if (response.CheckoutRequestID) {
                // Handle different response format (camelCase vs PascalCase)
                setCheckoutRequestId(response.CheckoutRequestID);
                setStatus('Payment initiated. Please enter your M-Pesa PIN on your phone.');
                setPolling(true);
                pollStatus(response.CheckoutRequestID);
            } else {
                console.error('MpesaPayment - Invalid response format:', response);
                setStatus(response.error || 'Failed to initiate payment.');
            }
        } catch (err) {
            console.error('MpesaPayment - Error initiating payment:', err);
            setStatus('Error initiating payment. Please try again.');
        }
        setLoading(false);
    };

    const pollStatus = async (checkoutId: string) => {
        let attempts = 0;
        const maxAttempts = 15; // More attempts to ensure we catch completion
        const interval = 2000; // Check more frequently (every 2 seconds)
        
        // Update status message to show real-time progress
        const updateStatusMessage = (attemptNum: number) => {
            const statusMessages = [
                'Sending payment request to M-Pesa...',
                'Waiting for confirmation...',
                'Processing payment...',
                'Connecting to Safaricom...',
                'Awaiting your PIN confirmation...',
                'Verifying transaction...',
                'Finalizing payment...',
                'Almost done...'
            ];
            
            // Cycle through different status messages based on attempt number
            if (attemptNum < statusMessages.length) {
                return statusMessages[attemptNum];
            } else {
                return `Still processing payment (${attemptNum}s)...`;
            }
        };
        
        const poll = async () => {
            if (attempts >= maxAttempts) {
                setStatus('Payment process timed out. Please check your M-Pesa messages to confirm status.');
                setPolling(false);
                return;
            }
            
            // Update status message dynamically
            setStatus(updateStatusMessage(attempts));
            attempts++;
            
            try {
                const res = await checkMpesaPaymentStatus(token, checkoutId);
                if (res.status === 'completed') {
                    setStatus('✅ Payment successful! Your payment has been received.');
                    setPolling(false);
                    // Reset form on success
                    setPhoneNumber('');
                    setAmount(defaultAmount);
                    if (onSuccess) onSuccess();
                } else if (res.status === 'failed') {
                    setStatus('❌ Payment failed. Please try again.');
                    setPolling(false);
                } else {
                    // Continue polling
                    setTimeout(poll, interval);
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                setStatus('Error checking payment status. Please check your M-Pesa messages to confirm.');
                setPolling(false);
            }
        };
        
        poll();
    };

    return (
        <div className="mpesa-payment-container">
            <h2>Pay Service Fee via M-Pesa</h2>
            
            <div className="payment-info">
                <p><strong>Recipient:</strong> Sokoni Connect (0707607682)</p>
                <p className="payment-note">Payments will be sent to the Sokoni Connect business number</p>
            </div>
            
            {!polling && !loading && (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Your M-Pesa Phone Number</label>
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                            placeholder="07XXXXXXXX"
                            pattern="^(07|\+?254|0|\+?1)[0-9]{8,9}$"
                            title="Enter a valid Kenyan phone number"
                            required
                            disabled={loading || polling}
                        />
                        <small className="input-help">Format: 07XXXXXXXX or 254XXXXXXXX</small>
                    </div>
                    <div className="form-group">
                        <label>Amount (Ksh)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(Number(e.target.value))}
                            min={1}
                            max={10000}
                            required
                            disabled={loading || polling}
                        />
                    </div>
                    <button type="submit" className="login-btn" disabled={loading || polling}>
                        {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                </form>
            )}
            
            {polling && (
                <div className="payment-processing">
                    <div className="processing-spinner"></div>
                    <p className="processing-text">Processing your payment</p>
                    <p className="processing-note">Please wait and check your phone for M-Pesa prompts</p>
                </div>
            )}
            
            {status && <div className={`payment-status ${status.includes('successful') ? 'success' : ''}`}>{status}</div>}
        </div>
    );
};

export default MpesaPayment;
