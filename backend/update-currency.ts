import db from './database';

console.log('Checking if currency field exists in market_products table...');

// Check if currency column exists
const tableInfo = db.prepare("PRAGMA table_info(market_products)").all();
const hasCurrency = tableInfo.some((column: any) => column.name === 'currency');

// If currency column doesn't exist, add it
if (!hasCurrency) {
    console.log('Adding currency column to market_products table...');
    db.prepare("ALTER TABLE market_products ADD COLUMN currency TEXT DEFAULT 'Ksh'").run();
} else {
    console.log('Updating currency to Ksh...');
    db.prepare("UPDATE market_products SET currency = 'Ksh'").run();
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

console.log('Currency updated successfully!');
