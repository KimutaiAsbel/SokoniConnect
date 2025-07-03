import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { initializeDatabase } from './database';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// Middleware to verify JWT token
interface AuthRequest extends express.Request {
    userId?: number;
}

const authenticateToken = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) return res.sendStatus(403);
        req.userId = decoded.userId;
        next();
    });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        const result = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, passwordHash);
        
        // Generate JWT token
        const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: result.lastInsertRowid,
                username,
                email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Market data routes
app.get('/api/markets', (req, res) => {
    try {
        const markets = db.prepare('SELECT * FROM markets ORDER BY name').all();
        res.json(markets);
    } catch (error) {
        console.error('Error fetching markets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/products', (req, res) => {
    try {
        const products = db.prepare(`
            SELECT p.*, mp.price, mp.availability, mp.stock_quantity, m.name as market_name, mp.market_id
            FROM products p
            LEFT JOIN market_products mp ON p.id = mp.product_id
            LEFT JOIN markets m ON mp.market_id = m.id
            ORDER BY p.name, m.name
        `).all();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/market-data', (req, res) => {
    try {
        const { marketId } = req.query;
        let query = `
            SELECT 
                p.id as productId,
                p.name as productName,
                mp.price,
                mp.availability,
                mp.stock_quantity,
                m.name as marketName,
                mp.last_updated
            FROM market_products mp
            JOIN products p ON mp.product_id = p.id
            JOIN markets m ON mp.market_id = m.id
        `;
        
        const params: any[] = [];
        if (marketId) {
            query += ' WHERE mp.market_id = ?';
            params.push(marketId);
        }
        
        query += ' ORDER BY p.name';
        
        const marketData = db.prepare(query).all(...params);
        res.json(marketData);
    } catch (error) {
        console.error('Error fetching market data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Market alerts routes
app.get('/api/alerts', authenticateToken, (req: AuthRequest, res) => {
    try {
        const alerts = db.prepare(`
            SELECT 
                ma.*,
                m.name as market_name,
                p.name as product_name
            FROM market_alerts ma
            LEFT JOIN markets m ON ma.market_id = m.id
            LEFT JOIN products p ON ma.product_id = p.id
            WHERE ma.user_id = ?
            ORDER BY ma.created_at DESC
        `).all(req.userId);
        
        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/alerts', authenticateToken, (req: AuthRequest, res) => {
    try {
        const { title, description, alert_type, market_id, product_id, is_active } = req.body;
        
        const result = db.prepare(`
            INSERT INTO market_alerts (user_id, title, description, alert_type, market_id, product_id, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(req.userId, title, description, alert_type, market_id || null, product_id || null, is_active);
        
        res.status(201).json({
            message: 'Alert created successfully',
            alertId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Error creating alert:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/alerts/:id', authenticateToken, (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { title, description, alert_type, market_id, product_id, is_active } = req.body;
        
        const result = db.prepare(`
            UPDATE market_alerts 
            SET title = ?, description = ?, alert_type = ?, market_id = ?, product_id = ?, is_active = ?
            WHERE id = ? AND user_id = ?
        `).run(title, description, alert_type, market_id || null, product_id || null, is_active, id, req.userId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Alert not found' });
        }
        
        res.json({ message: 'Alert updated successfully' });
    } catch (error) {
        console.error('Error updating alert:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/alerts/:id', authenticateToken, (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        
        const result = db.prepare('DELETE FROM market_alerts WHERE id = ? AND user_id = ?').run(id, req.userId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Alert not found' });
        }
        
        res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Attendance routes
app.get('/api/attendance', authenticateToken, (req: AuthRequest, res) => {
    try {
        const attendance = db.prepare(`
            SELECT 
                ar.*,
                m.name as market_name
            FROM attendance_records ar
            JOIN markets m ON ar.market_id = m.id
            WHERE ar.user_id = ?
            ORDER BY ar.date DESC, ar.check_in_time DESC
        `).all(req.userId);
        
        res.json(attendance);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/attendance/checkin', authenticateToken, (req: AuthRequest, res) => {
    try {
        const { market_id } = req.body;
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        
        // Check if already checked in today
        const existingRecord = db.prepare(`
            SELECT id FROM attendance_records 
            WHERE user_id = ? AND market_id = ? AND date = ? AND check_out_time IS NULL
        `).get(req.userId, market_id, date);
        
        if (existingRecord) {
            return res.status(400).json({ error: 'Already checked in today' });
        }
        
        const result = db.prepare(`
            INSERT INTO attendance_records (user_id, market_id, check_in_time, date)
            VALUES (?, ?, ?, ?)
        `).run(req.userId, market_id, now.toISOString(), date);
        
        res.status(201).json({
            message: 'Checked in successfully',
            recordId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Error checking in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/attendance/checkout', authenticateToken, (req: AuthRequest, res) => {
    try {
        const { market_id } = req.body;
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        
        const result = db.prepare(`
            UPDATE attendance_records 
            SET check_out_time = ?
            WHERE user_id = ? AND market_id = ? AND date = ? AND check_out_time IS NULL
        `).run(now.toISOString(), req.userId, market_id, date);
        
        if (result.changes === 0) {
            return res.status(400).json({ error: 'No active check-in found' });
        }
        
        res.json({ message: 'Checked out successfully' });
    } catch (error) {
        console.error('Error checking out:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Sokoni Connect API server running on port ${PORT}`);
    console.log(`📊 Database: SQLite (sokoni.db)`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

export default app;
