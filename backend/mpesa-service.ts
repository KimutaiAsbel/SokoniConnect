import axios from 'axios';
import { Buffer } from 'buffer';

// M-Pesa API configuration (replace with actual credentials in production)
const CONSUMER_KEY = 'your-consumer-key';
const CONSUMER_SECRET = 'your-consumer-secret';
const BUSINESS_SHORT_CODE = '174379'; // Lipa Na M-Pesa shortcode (sandbox)
const BUSINESS_PHONE_NUMBER = '0707607682'; // The M-Pesa number to receive payments
const PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'; // Sandbox passkey
const TRANSACTION_TYPE = 'CustomerPayBillOnline';
const CALLBACK_URL = 'http://localhost:5000/api/payments/mpesa/callback';

// Get OAuth token
const getAccessToken = async () => {
    try {
        const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw new Error('Failed to get access token');
    }
};

// Generate timestamp in the format required by Safaricom
const getTimestamp = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
};

// Generate password
const getPassword = (timestamp: string) => {
    return Buffer.from(`${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`).toString('base64');
};

// Initiate STK Push
export const initiateMpesaPayment = async (
    phoneNumber: string, 
    amount: number, 
    accountReference: string,
    description: string
) => {
    try {
        const timestamp = getTimestamp();
        const password = getPassword(timestamp);
        const accessToken = await getAccessToken();
        
        // Format phone number (remove leading 0 if present and ensure it starts with 254)
        let formattedPhone = phoneNumber;
        if (phoneNumber.startsWith('0')) {
            formattedPhone = `254${phoneNumber.substring(1)}`;
        }
        if (!phoneNumber.startsWith('254')) {
            formattedPhone = `254${phoneNumber}`;
        }

        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                BusinessShortCode: BUSINESS_SHORT_CODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: TRANSACTION_TYPE,
                Amount: Math.round(amount), // M-Pesa requires integers
                PartyA: formattedPhone,
                PartyB: BUSINESS_SHORT_CODE,
                PhoneNumber: formattedPhone,
                CallBackURL: CALLBACK_URL,
                AccountReference: accountReference,
                TransactionDesc: description
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error initiating M-Pesa payment:', error);
        throw error;
    }
};

// Query payment status
export const checkPaymentStatus = async (checkoutRequestID: string) => {
    try {
        const timestamp = getTimestamp();
        const password = getPassword(timestamp);
        const accessToken = await getAccessToken();
        
        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
            {
                BusinessShortCode: BUSINESS_SHORT_CODE,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestID
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error checking payment status:', error);
        throw error;
    }
};
