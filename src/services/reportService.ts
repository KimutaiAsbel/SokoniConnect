import axios from 'axios';

export interface ReportFilter {
    reportType: string;
    startDate: string;
    endDate: string;
    marketName?: string;
    productName?: string;
}

export interface ReportData {
    date: string;
    marketName: string;
    productName: string;
    quantity: number;
    price: number;
    totalSales: number;
    traderCount: number;
}

export interface ReportStats {
    totalSales: number;
    totalQuantity: number;
    avgPrice: number;
    transactions: number;
    totalTraders: number;
    avgTradersPerDay: number;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Generate a report based on filters
export const generateReport = async (filters: ReportFilter): Promise<ReportData[]> => {
    try {
        const response = await axios.post(`${API_URL}/reports/generate`, filters);
        return response.data;
    } catch (error) {
        console.error('Error generating report:', error);
        // Return sample data in case of an error
        return getSampleReportData();
    }
};

// Get report statistics
export const getReportStats = (data: ReportData[]): ReportStats => {
    const totalSales = data.reduce((sum, item) => sum + item.totalSales, 0);
    const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
    const avgPrice = totalQuantity > 0 ? totalSales / totalQuantity : 0;
    
    // Calculate trader stats
    const uniqueDatesMap: Record<string, boolean> = {};
    const uniqueMarketsMap: Record<string, boolean> = {};
    
    data.forEach(item => {
        uniqueDatesMap[item.date] = true;
        uniqueMarketsMap[item.marketName] = true;
    });
    
    const uniqueDates = Object.keys(uniqueDatesMap);
    const uniqueMarkets = Object.keys(uniqueMarketsMap);
    
    // Get the maximum trader count for each market on each day
    const traderCountByMarketAndDay: Record<string, number> = {};
    data.forEach(item => {
        const key = `${item.marketName}-${item.date}`;
        if (!traderCountByMarketAndDay[key] || traderCountByMarketAndDay[key] < item.traderCount) {
            traderCountByMarketAndDay[key] = item.traderCount;
        }
    });
    
    // Calculate total traders (sum of max traders per market per day)
    const totalTraders = Object.values(traderCountByMarketAndDay).reduce((sum, count) => sum + count, 0);
    
    // Calculate average traders per day across all markets
    const avgTradersPerDay = uniqueDates.length > 0 ? totalTraders / uniqueDates.length : 0;
    
    return {
        totalSales,
        totalQuantity,
        avgPrice,
        transactions: data.length,
        totalTraders,
        avgTradersPerDay
    };
};

// Export report as CSV
export const exportReportAsCSV = (data: ReportData[], filename: string = 'report.csv'): void => {
    const headers = ['Date', 'Market', 'Product', 'Quantity (kg)', 'Price (Ksh)', 'Total (Ksh)', 'Traders'];
    const rows = data.map(item => [
        item.date,
        item.marketName,
        item.productName,
        item.quantity.toString(),
        item.price.toString(),
        item.totalSales.toString(),
        item.traderCount.toString()
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Get available markets for reports
export const getAvailableMarkets = async (): Promise<string[]> => {
    try {
        const response = await axios.get(`${API_URL}/markets`);
        return response.data.map((market: any) => market.name);
    } catch (error) {
        console.error('Error fetching markets:', error);
        return ['Kapsabet Market', 'Nandi Hills Market', 'Mosoriot Market'];
    }
};

// Get available products for reports
export const getAvailableProducts = async (): Promise<string[]> => {
    try {
        const response = await axios.get(`${API_URL}/products`);
        return response.data.map((product: any) => product.name);
    } catch (error) {
        console.error('Error fetching products:', error);
        return ['Tomatoes', 'Maize', 'Rice', 'Potatoes', 'Beans'];
    }
};

// Sample data for when the API is not available
export const getSampleReportData = (): ReportData[] => {
    return [
        { date: '2025-07-01', marketName: 'Kapsabet Market', productName: 'Tomatoes', quantity: 120, price: 800, totalSales: 96000, traderCount: 45 },
        { date: '2025-07-01', marketName: 'Kapsabet Market', productName: 'Maize', quantity: 200, price: 600, totalSales: 120000, traderCount: 45 },
        { date: '2025-07-02', marketName: 'Kapsabet Market', productName: 'Tomatoes', quantity: 110, price: 820, totalSales: 90200, traderCount: 42 },
        { date: '2025-07-02', marketName: 'Kapsabet Market', productName: 'Maize', quantity: 180, price: 610, totalSales: 109800, traderCount: 42 },
        { date: '2025-07-03', marketName: 'Kapsabet Market', productName: 'Tomatoes', quantity: 150, price: 800, totalSales: 120000, traderCount: 48 },
        { date: '2025-07-03', marketName: 'Kapsabet Market', productName: 'Maize', quantity: 220, price: 600, totalSales: 132000, traderCount: 48 },
        { date: '2025-07-01', marketName: 'Nandi Hills Market', productName: 'Tomatoes', quantity: 90, price: 750, totalSales: 67500, traderCount: 38 },
        { date: '2025-07-01', marketName: 'Nandi Hills Market', productName: 'Rice', quantity: 150, price: 1200, totalSales: 180000, traderCount: 38 },
        { date: '2025-07-02', marketName: 'Nandi Hills Market', productName: 'Tomatoes', quantity: 95, price: 780, totalSales: 74100, traderCount: 35 },
        { date: '2025-07-02', marketName: 'Nandi Hills Market', productName: 'Rice', quantity: 140, price: 1180, totalSales: 165200, traderCount: 35 },
        { date: '2025-07-03', marketName: 'Nandi Hills Market', productName: 'Tomatoes', quantity: 105, price: 790, totalSales: 82950, traderCount: 40 },
        { date: '2025-07-03', marketName: 'Nandi Hills Market', productName: 'Rice', quantity: 165, price: 1220, totalSales: 201300, traderCount: 40 },
        { date: '2025-07-01', marketName: 'Mosoriot Market', productName: 'Potatoes', quantity: 180, price: 550, totalSales: 99000, traderCount: 32 },
        { date: '2025-07-02', marketName: 'Mosoriot Market', productName: 'Potatoes', quantity: 195, price: 540, totalSales: 105300, traderCount: 30 },
        { date: '2025-07-03', marketName: 'Mosoriot Market', productName: 'Potatoes', quantity: 210, price: 560, totalSales: 117600, traderCount: 34 },
    ];
};
