import { MarketData } from '../types';
import { getToken } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

interface ProductAvailability {
    productId: string;
    productName: string;
    availability: boolean;
    stock: number;
    lastUpdated: string;
}

interface PricingInformation {
    productId: string;
    productName: string;
    currentPrice: number;
    previousPrice: number;
    priceChange: number;
    priceChangePercent: number;
    marketTrend: 'up' | 'down' | 'stable';
}

export const fetchMarketData = async (): Promise<MarketData[]> => {
    try {
        const response = await fetch(`${API_URL}/market-data`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch market data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching market data:', error);
        throw error;
    }
};

export const fetchProductAvailability = async (productId: string): Promise<ProductAvailability> => {
    try {
        // For now, we'll get all market data and filter by product
        // In a real implementation, this would be a separate endpoint
        const marketData = await fetchMarketData();
        const product = marketData.find((p: any) => p.productId === productId);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        return {
            productId: product.productId,
            productName: product.productName,
            availability: product.availability,
            stock: product.stock_quantity || 0,
            lastUpdated: product.last_updated || new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error fetching product availability:', error);
        throw error;
    }
};

export const fetchPricingInformation = async (productId: string): Promise<PricingInformation> => {
    try {
        // For now, we'll get all market data and filter by product
        // In a real implementation, this would be a separate endpoint with historical data
        const marketData = await fetchMarketData();
        const product = marketData.find((p: any) => p.productId === productId);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Simulate price change data
        const currentPrice = product.price;
        const previousPrice = currentPrice + (Math.random() * 20 - 10);
        const priceChange = currentPrice - previousPrice;
        const priceChangePercent = (priceChange / previousPrice) * 100;
        
        return {
            productId: product.productId,
            productName: product.productName,
            currentPrice: currentPrice,
            previousPrice: Math.round(previousPrice * 100) / 100,
            priceChange: Math.round(priceChange * 100) / 100,
            priceChangePercent: Math.round(priceChangePercent * 100) / 100,
            marketTrend: priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : 'stable',
        };
    } catch (error) {
        console.error('Error fetching pricing information:', error);
        throw error;
    }
};

export const fetchMarkets = async () => {
    try {
        const response = await fetch(`${API_URL}/markets`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch markets');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching markets:', error);
        throw error;
    }
};

export const searchProducts = async (query: string): Promise<MarketData[]> => {
    try {
        const marketData = await fetchMarketData();
        return marketData.filter((product: any) => 
            product.productName.toLowerCase().includes(query.toLowerCase())
        );
    } catch (error) {
        console.error('Error searching products:', error);
        throw error;
    }
};