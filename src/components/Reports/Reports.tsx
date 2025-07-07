import React, { useState, useEffect } from 'react';
import './Reports.css';
import { 
    generateReport, 
    getReportStats, 
    exportReportAsCSV,
    getAvailableMarkets, 
    getAvailableProducts,
    ReportData,
    ReportFilter 
} from '../../services/reportService';

const Reports: React.FC = () => {
    const [reportType, setReportType] = useState<string>('marketPerformance');
    const [startDate, setStartDate] = useState<string>('2025-06-01');
    const [endDate, setEndDate] = useState<string>('2025-07-03');
    const [selectedMarket, setSelectedMarket] = useState<string>('all');
    const [selectedProduct, setSelectedProduct] = useState<string>('all');
    const [showReport, setShowReport] = useState<boolean>(false);
    const [reportData, setReportData] = useState<ReportData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [markets, setMarkets] = useState<string[]>([]);
    const [products, setProducts] = useState<string[]>([]);
    
    useEffect(() => {
        // Fetch available markets and products when component mounts
        const fetchData = async () => {
            try {
                const marketsData = await getAvailableMarkets();
                const productsData = await getAvailableProducts();
                
                setMarkets(marketsData);
                setProducts(productsData);
            } catch (error) {
                console.error('Error fetching filter options:', error);
            }
        };
        
        fetchData();
    }, []);
    
    // Filter data based on selections
    const getFilteredData = () => {
        let filtered = [...reportData];
        
        if (selectedMarket !== 'all') {
            filtered = filtered.filter(item => item.marketName === selectedMarket);
        }
        
        if (selectedProduct !== 'all') {
            filtered = filtered.filter(item => item.productName === selectedProduct);
        }
        
        return filtered;
    };
    
    const handleGenerateReport = async () => {
        setIsLoading(true);
        
        const filters: ReportFilter = {
            reportType,
            startDate,
            endDate,
            marketName: selectedMarket !== 'all' ? selectedMarket : undefined,
            productName: selectedProduct !== 'all' ? selectedProduct : undefined
        };
        
        try {
            const data = await generateReport(filters);
            setReportData(data);
            setShowReport(true);
        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePrintReport = () => {
        window.print();
    };
    
    const handleExportCSV = () => {
        const filteredData = getFilteredData();
        const reportName = `${reportType}_${startDate}_to_${endDate}.csv`;
        exportReportAsCSV(filteredData, reportName);
    };
    
    const filteredData = getFilteredData();
    const stats = getReportStats(filteredData);
    
    return (
        <div className="reports">
            <div className="reports-header">
                <h2>Reports &amp; Analytics</h2>
                <p>Generate detailed reports and insights about market performance</p>
            </div>
            
            <div className="report-filters">
                <div className="filter-group">
                    <label>Report Type</label>
                    <select 
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                    >
                        <option value="marketPerformance">Market Performance</option>
                        <option value="productSales">Product Sales</option>
                        <option value="attendanceReport">Attendance Report</option>
                        <option value="priceComparison">Price Comparison</option>
                    </select>
                </div>
                
                <div className="filter-group">
                    <label>Market</label>
                    <select 
                        value={selectedMarket}
                        onChange={(e) => setSelectedMarket(e.target.value)}
                    >
                        <option value="all">All Markets</option>
                        {markets.map((market) => (
                            <option key={market} value={market}>{market}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label>Product</label>
                    <select 
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                        <option value="all">All Products</option>
                        {products.map((product) => (
                            <option key={product} value={product}>{product}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label>Date Range</label>
                    <div className="date-range">
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span>to</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
                
                <button className="generate-btn" onClick={handleGenerateReport} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>
            
            {!showReport ? (
                <div className="report-types">
                    <div className="report-card" onClick={() => setReportType('marketPerformance')}>
                        <h3>📊 Market Performance Report</h3>
                        <p>Analysis of overall market performance including sales volume, revenue, and popular products.</p>
                        <p>Useful for: Market administrators, policy makers</p>
                    </div>
                    
                    <div className="report-card" onClick={() => setReportType('productSales')}>
                        <h3>🛒 Product Sales Report</h3>
                        <p>Detailed breakdown of product sales, prices, and inventory movements.</p>
                        <p>Useful for: Traders, inventory managers</p>
                    </div>
                    
                    <div className="report-card" onClick={() => setReportType('attendanceReport')}>
                        <h3>👥 Attendance Report</h3>
                        <p>Trader and customer attendance patterns, market day analytics.</p>
                        <p>Useful for: Market administrators, planners</p>
                    </div>
                    
                    <div className="report-card" onClick={() => setReportType('priceComparison')}>
                        <h3>💰 Price Comparison Report</h3>
                        <p>Comparative analysis of prices across different markets and over time.</p>
                        <p>Useful for: Traders, buyers, economic analysts</p>
                    </div>
                </div>
            ) : (
                <div className="report-preview">
                    <h3>
                        {reportType === 'marketPerformance' && '📊 Market Performance Report'}
                        {reportType === 'productSales' && '🛒 Product Sales Report'}
                        {reportType === 'attendanceReport' && '👥 Attendance Report'}
                        {reportType === 'priceComparison' && '💰 Price Comparison Report'}
                        <div className="action-buttons">
                            <button className="action-btn" onClick={handlePrintReport}>
                                🖨️ Print
                            </button>
                            <button className="action-btn" onClick={handleExportCSV}>
                                📊 Export CSV
                            </button>
                        </div>
                    </h3>
                    
                    <div>
                        <p><strong>Period:</strong> {startDate} to {endDate}</p>
                        <p><strong>Market:</strong> {selectedMarket === 'all' ? 'All Markets' : selectedMarket}</p>
                        <p><strong>Product:</strong> {selectedProduct === 'all' ? 'All Products' : selectedProduct}</p>
                    </div>
                    
                    <div className="summary-stats">
                        <div className="stat-card">
                            <h4>Total Sales</h4>
                            <p>{stats.totalSales.toLocaleString()} Ksh</p>
                        </div>
                        
                        <div className="stat-card">
                            <h4>Total Quantity</h4>
                            <p>{stats.totalQuantity.toLocaleString()} kg</p>
                        </div>
                        
                        <div className="stat-card">
                            <h4>Average Price</h4>
                            <p>{stats.avgPrice.toFixed(2)} Ksh</p>
                        </div>
                        
                        <div className="stat-card">
                            <h4>Total Traders</h4>
                            <p>{stats.totalTraders}</p>
                        </div>
                        
                        <div className="stat-card">
                            <h4>Avg Traders/Day</h4>
                            <p>{stats.avgTradersPerDay.toFixed(0)}</p>
                        </div>
                        
                        <div className="stat-card">
                            <h4>Transactions</h4>
                            <p>{stats.transactions}</p>
                        </div>
                    </div>
                    
                    <div className="report-data">
                        <h4>Detailed Data</h4>
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Market</th>
                                    <th>Product</th>
                                    <th>Quantity (kg)</th>
                                    <th>Price (Ksh)</th>
                                    <th>Total (Ksh)</th>
                                    <th>Traders</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.date}</td>
                                        <td>{item.marketName}</td>
                                        <td>{item.productName}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.price}</td>
                                        <td>{item.totalSales.toLocaleString()}</td>
                                        <td>{item.traderCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="report-charts">
                        <div className="chart-container">
                            <h4>Sales Trend</h4>
                            <div className="chart-placeholder">
                                [Sales trend chart would appear here]
                            </div>
                        </div>
                        
                        <div className="chart-container">
                            <h4>Product Distribution</h4>
                            <div className="chart-placeholder">
                                [Product distribution chart would appear here]
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
