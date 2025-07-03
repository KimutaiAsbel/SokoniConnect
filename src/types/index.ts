export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
}

export interface MarketData {
    productId: string;
    productName: string;
    price: number;
    availability: boolean;
    stock_quantity?: number;
    last_updated?: string;
    marketName?: string;
    market_id?: number;
}

export interface AttendanceRecord {
    userId: string;
    marketId: string;
    checkInTime: Date;
    checkOutTime?: Date;
}

export interface Market {
    id: number;
    name: string;
    location: string;
    description?: string;
    created_at: string;
}

export interface Product {
    id: number;
    name: string;
    category?: string;
    description?: string;
    created_at: string;
}

export interface MarketAlert {
    id: number;
    user_id: number;
    title: string;
    description?: string;
    alert_type: string;
    market_id?: number;
    product_id?: number;
    is_active: boolean;
    created_at: string;
    market_name?: string;
    product_name?: string;
}