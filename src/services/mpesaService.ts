const API_BASE = 'http://localhost:5000/api/mpesa';

export const initiateMpesaPayment = async (token: string, phoneNumber: string, amount: number, description = 'Sokoni Connect Service Fee') => {
    const response = await fetch(`${API_BASE}/initiate-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phoneNumber, amount, description })
    });
    return response.json();
};

export const checkMpesaPaymentStatus = async (token: string, checkoutRequestId: string) => {
    const response = await fetch(`${API_BASE}/check-payment-status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ checkoutRequestId })
    });
    return response.json();
};

export const getPaymentHistory = async (token: string) => {
    try {
        console.log('Fetching payment history from:', `${API_BASE}/payment-history`);
        const response = await fetch(`${API_BASE}/payment-history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.error('Payment history fetch failed with status:', response.status);
            throw new Error(`Payment history fetch failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Payment history data received:', data);
        return data;
    } catch (error) {
        console.error('Error in getPaymentHistory:', error);
        return [];
    }
};
