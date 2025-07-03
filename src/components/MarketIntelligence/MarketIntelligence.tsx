import React, { useState, useEffect } from 'react';
import './MarketIntelligence.css';

interface MarketData {
    id: string;
    marketName: string;
    location: string;
    products: Product[];
    attendance: {
        traders: number;
        customers: number;
        lastUpdated: string;
    };
}

interface Product {
    id: string;
    name: string;
    price: number;
    currency: string;
    unit: string;
    availability: 'high' | 'medium' | 'low';
    trend: 'up' | 'down' | 'stable';
    lastUpdated: string;
}

const MarketIntelligence: React.FC = () => {
    const [markets, setMarkets] = useState<MarketData[]>([
        {
            id: '1',
            marketName: 'Kimara Market',
            location: 'Kimara, Dar es Salaam',
            products: [
                { id: '1', name: 'Tomatoes', price: 800, currency: 'TSh', unit: 'kg', availability: 'high', trend: 'stable', lastUpdated: '2025-07-03' },
                { id: '2', name: 'Maize', price: 600, currency: 'TSh', unit: 'kg', availability: 'medium', trend: 'up', lastUpdated: '2025-07-03' },
                { id: '3', name: 'Rice', price: 1200, currency: 'TSh', unit: 'kg', availability: 'high', trend: 'down', lastUpdated: '2025-07-03' },
                { id: '4', name: 'Onions', price: 900, currency: 'TSh', unit: 'kg', availability: 'low', trend: 'up', lastUpdated: '2025-07-03' }
            ],
            attendance: { traders: 85, customers: 230, lastUpdated: '2025-07-03' }
        },
        {
            id: '2',
            marketName: 'Kariakoo Market',
            location: 'Kariakoo, Dar es Salaam',
            products: [
                { id: '5', name: 'Tomatoes', price: 750, currency: 'TSh', unit: 'kg', availability: 'medium', trend: 'up', lastUpdated: '2025-07-03' },
                { id: '6', name: 'Maize', price: 580, currency: 'TSh', unit: 'kg', availability: 'high', trend: 'stable', lastUpdated: '2025-07-03' },
                { id: '7', name: 'Rice', price: 1150, currency: 'TSh', unit: 'kg', availability: 'medium', trend: 'stable', lastUpdated: '2025-07-03' },
                { id: '8', name: 'Beans', price: 1000, currency: 'TSh', unit: 'kg', availability: 'high', trend: 'down', lastUpdated: '2025-07-03' }
            ],
            attendance: { traders: 120, customers: 450, lastUpdated: '2025-07-03' }
        },
        {
            id: '3',
            marketName: 'Tandika Market',
            location: 'Tandika, Dar es Salaam',
            products: [
                { id: '9', name: 'Tomatoes', price: 850, currency: 'TSh', unit: 'kg', availability: 'low', trend: 'up', lastUpdated: '2025-07-03' },
                { id: '10', name: 'Potatoes', price: 700, currency: 'TSh', unit: 'kg', availability: 'high', trend: 'stable', lastUpdated: '2025-07-03' },
                { id: '11', name: 'Carrots', price: 1100, currency: 'TSh', unit: 'kg', availability: 'medium', trend: 'up', lastUpdated: '2025-07-03' }
            ],
            attendance: { traders: 65, customers: 180, lastUpdated: '2025-07-03' }
        }
    ]);

    const [selectedMarket, setSelectedMarket] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState('all');

    const getAllProducts = () => {
        const allProducts: Product[] = [];
        markets.forEach(market => {
            market.products.forEach(product => {
                const existingProduct = allProducts.find(p => p.name === product.name);
                if (!existingProduct) {
                    allProducts.push({...product, id: `all-${product.name}`});
                }
            });
        });
        return allProducts;
    };

    const getProductPriceComparison = (productName: string) => {
        const prices: { market: string; price: number; availability: string }[] = [];
        markets.forEach(market => {
            const product = market.products.find(p => p.name === productName);
            if (product) {
                prices.push({
                    market: market.marketName,
                    price: product.price,
                    availability: product.availability
                });
            }
        });
        return prices.sort((a, b) => a.price - b.price);
    };

    const filteredMarkets = selectedMarket === 'all' ? markets : markets.filter(m => m.id === selectedMarket);
    const allProducts = getAllProducts();

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return '📈';
            case 'down': return '📉';
            case 'stable': return '📊';
            default: return '📊';
        }
    };

    const getAvailabilityColor = (availability: string) => {
        switch (availability) {
            case 'high': return '#28a745';
            case 'medium': return '#ffc107';
            case 'low': return '#dc3545';
            default: return '#6c757d';
        }
    };

    return (
        <div className="market-intelligence">
            <div className="intelligence-header">
                <h2>Market Intelligence</h2>
                <p>Real-time data on product availability, pricing, and market attendance across different markets</p>
            </div>

            <div className="filters">
                <div className="filter-group">
                    <label>Market:</label>
                    <select value={selectedMarket} onChange={(e) => setSelectedMarket(e.target.value)}>
                        <option value="all">All Markets</option>
                        {markets.map(market => (
                            <option key={market.id} value={market.id}>{market.marketName}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Product:</label>
                    <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                        <option value="all">All Products</option>
                        {allProducts.map(product => (
                            <option key={product.id} value={product.name}>{product.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedProduct !== 'all' && (
                <div className="price-comparison">
                    <h3>Price Comparison for {selectedProduct}</h3>
                    <div className="comparison-grid">
                        {getProductPriceComparison(selectedProduct).map((item, index) => (
                            <div key={item.market} className={`comparison-card ${index === 0 ? 'best-price' : ''}`}>
                                <h4>{item.market}</h4>
                                <p className="price">{item.price} TSh/kg</p>
                                <p className="availability">
                                    <span 
                                        className="availability-dot"
                                        style={{ backgroundColor: getAvailabilityColor(item.availability) }}
                                    ></span>
                                    {item.availability} availability
                                </p>
                                {index === 0 && <span className="best-price-badge">Best Price</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="markets-grid">
                {filteredMarkets.map(market => (
                    <div key={market.id} className="market-card">
                        <div className="market-header">
                            <h3>{market.marketName}</h3>
                            <p className="market-location">📍 {market.location}</p>
                        </div>

                        <div className="attendance-info">
                            <h4>Today's Attendance</h4>
                            <div className="attendance-stats">
                                <div className="stat">
                                    <span className="stat-number">{market.attendance.traders}</span>
                                    <span className="stat-label">Traders</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">{market.attendance.customers}</span>
                                    <span className="stat-label">Customers</span>
                                </div>
                            </div>
                            <p className="last-updated">Last updated: {market.attendance.lastUpdated}</p>
                        </div>

                        <div className="products-section">
                            <h4>Product Prices</h4>
                            <div className="products-list">
                                {market.products
                                    .filter(product => selectedProduct === 'all' || product.name === selectedProduct)
                                    .map(product => (
                                    <div key={product.id} className="product-item">
                                        <div className="product-info">
                                            <span className="product-name">{product.name}</span>
                                            <span className="product-price">
                                                {product.price} {product.currency}/{product.unit}
                                            </span>
                                        </div>
                                        <div className="product-meta">
                                            <span 
                                                className="availability-indicator"
                                                style={{ color: getAvailabilityColor(product.availability) }}
                                            >
                                                ● {product.availability}
                                            </span>
                                            <span className="trend-indicator">
                                                {getTrendIcon(product.trend)} {product.trend}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="summary-section">
                <h3>Market Summary</h3>
                <div className="summary-grid">
                    <div className="summary-card">
                        <h4>Total Markets</h4>
                        <p className="summary-number">{markets.length}</p>
                    </div>
                    <div className="summary-card">
                        <h4>Total Traders</h4>
                        <p className="summary-number">
                            {markets.reduce((sum, market) => sum + market.attendance.traders, 0)}
                        </p>
                    </div>
                    <div className="summary-card">
                        <h4>Total Customers</h4>
                        <p className="summary-number">
                            {markets.reduce((sum, market) => sum + market.attendance.customers, 0)}
                        </p>
                    </div>
                    <div className="summary-card">
                        <h4>Unique Products</h4>
                        <p className="summary-number">{allProducts.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketIntelligence;