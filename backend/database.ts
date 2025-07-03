import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

// Initialize SQLite database
const dbPath = path.join(__dirname, 'sokoni.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
export function initializeDatabase() {
    console.log('Initializing database...');

    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Markets table
    db.exec(`
        CREATE TABLE IF NOT EXISTS markets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Products table
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Market products (products available in specific markets with pricing)
    db.exec(`
        CREATE TABLE IF NOT EXISTS market_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            market_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            availability BOOLEAN DEFAULT 1,
            stock_quantity INTEGER DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (market_id) REFERENCES markets(id),
            FOREIGN KEY (product_id) REFERENCES products(id),
            UNIQUE(market_id, product_id)
        )
    `);

    // Market alerts table
    db.exec(`
        CREATE TABLE IF NOT EXISTS market_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            alert_type TEXT NOT NULL,
            market_id INTEGER,
            product_id INTEGER,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (market_id) REFERENCES markets(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);

    // Attendance records table
    db.exec(`
        CREATE TABLE IF NOT EXISTS attendance_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            market_id INTEGER NOT NULL,
            check_in_time DATETIME NOT NULL,
            check_out_time DATETIME,
            date DATE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (market_id) REFERENCES markets(id)
        )
    `);

    // Insert sample data
    insertSampleData();
    
    console.log('Database initialized successfully!');
}

function insertSampleData() {
    // Check if data already exists
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCount.count > 0) {
        console.log('Sample data already exists, skipping insertion.');
        return;
    }

    console.log('Inserting sample data...');

    // Insert demo user
    const passwordHash = bcrypt.hashSync('password', 10);
    db.prepare(`
        INSERT INTO users (username, email, password_hash) 
        VALUES (?, ?, ?)
    `).run('demo', 'demo@sokoni.com', passwordHash);

    // Insert sample markets
    const insertMarket = db.prepare('INSERT INTO markets (name, location, description) VALUES (?, ?, ?)');
    insertMarket.run('Central Market', 'Downtown', 'Main marketplace in the city center');
    insertMarket.run('North Market', 'Northside', 'Community market serving northern districts');
    insertMarket.run('South Market', 'Southside', 'Fresh produce market in the south');

    // Insert sample products
    const insertProduct = db.prepare('INSERT INTO products (name, category, description) VALUES (?, ?, ?)');
    const products = [
        ['Tomatoes', 'Vegetables', 'Fresh red tomatoes'],
        ['Onions', 'Vegetables', 'Local white onions'],
        ['Potatoes', 'Vegetables', 'Irish potatoes'],
        ['Carrots', 'Vegetables', 'Fresh carrots'],
        ['Cabbage', 'Vegetables', 'Green cabbage'],
        ['Spinach', 'Vegetables', 'Fresh spinach leaves'],
        ['Bananas', 'Fruits', 'Sweet bananas'],
        ['Oranges', 'Fruits', 'Juicy oranges'],
        ['Maize', 'Grains', 'White maize'],
        ['Rice', 'Grains', 'Long grain rice']
    ];

    products.forEach(([name, category, description]) => {
        insertProduct.run(name, category, description);
    });

    // Insert market products with pricing
    const insertMarketProduct = db.prepare(`
        INSERT INTO market_products (market_id, product_id, price, availability, stock_quantity) 
        VALUES (?, ?, ?, ?, ?)
    `);

    // Add products to all markets with different prices
    for (let marketId = 1; marketId <= 3; marketId++) {
        for (let productId = 1; productId <= 10; productId++) {
            const basePrice = [50, 40, 30, 45, 25, 20, 80, 60, 35, 55][productId - 1];
            const priceVariation = Math.random() * 10 - 5; // ±5 price variation
            const price = Math.max(10, basePrice + priceVariation);
            const availability = Math.random() > 0.2; // 80% availability rate
            const stock = availability ? Math.floor(Math.random() * 100) + 10 : 0;
            
            insertMarketProduct.run(marketId, productId, price.toFixed(2), availability ? 1 : 0, stock);
        }
    }

    // Insert sample alerts for demo user
    const insertAlert = db.prepare(`
        INSERT INTO market_alerts (user_id, title, description, alert_type, market_id, product_id, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertAlert.run(1, 'Tomato Price Drop', 'Alert when tomato prices drop below 45', 'price', 1, 1, 1);
    insertAlert.run(1, 'Market Day Reminder', 'Remind me about Central Market days', 'market_day', 1, null, 1);
    insertAlert.run(1, 'Onion Availability', 'Alert when onions are back in stock', 'availability', 2, 2, 0);

    console.log('Sample data inserted successfully!');
}

export default db;
