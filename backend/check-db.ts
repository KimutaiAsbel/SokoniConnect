import db from './database';

console.log('Checking database structure...');

// Check tables
const tables = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table'
`).all();

console.log('Tables:');
console.table(tables);

// Check payments table structure if it exists
const paymentTableExists = tables.some((table: any) => table.name === 'payments');

if (paymentTableExists) {
    const paymentColumns = db.prepare(`
        PRAGMA table_info(payments)
    `).all();
    
    console.log('Payments table columns:');
    console.table(paymentColumns);
} else {
    console.log('Payments table does not exist. Creating it...');
    
    db.exec(`
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            payment_type TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            reference TEXT NOT NULL,
            status TEXT NOT NULL,
            transaction_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);
    
    console.log('Payments table created successfully!');
}

console.log('Database check complete!');
