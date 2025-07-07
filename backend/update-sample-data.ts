import db from './database';

console.log('Adding sample market products with Kenyan Shilling...');

// First, check if market_products table has the currency column
const tableInfo = db.prepare("PRAGMA table_info(market_products)").all();
const hasCurrency = tableInfo.some((column: any) => column.name === 'currency');

// If currency column doesn't exist, add it
if (!hasCurrency) {
    console.log('Adding currency column to market_products table...');
    db.prepare("ALTER TABLE market_products ADD COLUMN currency TEXT DEFAULT 'Ksh'").run();
}

// Clear existing market_products data
db.prepare("DELETE FROM market_products").run();

// Insert market products with pricing in Kenyan Shillings
const insertMarketProduct = db.prepare(`
    INSERT INTO market_products (market_id, product_id, price, availability, stock_quantity, currency) 
    VALUES (?, ?, ?, ?, ?, 'Ksh')
`);

// Base prices in Kenyan Shillings for different products
const baseKshPrices = [
    120, // Tomatoes
    80,  // Onions
    100, // Potatoes
    90,  // Carrots
    50,  // Cabbage
    40,  // Spinach
    150, // Bananas
    120, // Oranges
    70,  // Maize
    110  // Rice
];

// Add products to all markets with different prices
for (let marketId = 1; marketId <= 3; marketId++) {
    for (let productId = 1; productId <= 10; productId++) {
        const basePrice = baseKshPrices[productId - 1];
        const priceVariation = Math.random() * 20 - 10; // ±10 price variation
        const price = Math.max(20, basePrice + priceVariation);
        const availability = Math.random() > 0.2; // 80% availability rate
        const stock = availability ? Math.floor(Math.random() * 100) + 10 : 0;
        
        insertMarketProduct.run(marketId, productId, price.toFixed(2), availability ? 1 : 0, stock);
    }
}

// Verify updates
const marketProducts = db.prepare(`
    SELECT mp.price, mp.currency, m.name as market_name, p.name as product_name 
    FROM market_products mp 
    JOIN markets m ON mp.market_id = m.id 
    JOIN products p ON mp.product_id = p.id 
    LIMIT 10
`).all();
console.table(marketProducts);

console.log('Sample market products added with Kenyan Shilling prices!');
