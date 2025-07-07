import db from './database';

console.log('Creating payments table...');

// Create payments table
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
