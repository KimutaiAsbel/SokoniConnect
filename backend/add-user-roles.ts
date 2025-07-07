import db from './database';
import bcrypt from 'bcryptjs';

console.log('Adding user roles to the database...');

// First, add a role column to the users table if it doesn't exist
try {
    const columns = db.prepare("PRAGMA table_info(users)").all();
    const roleColumnExists = columns.some((col: any) => col.name === 'role');
    
    if (!roleColumnExists) {
        console.log('Adding role column to users table...');
        db.exec('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "trader"');
        console.log('Role column added successfully!');
    } else {
        console.log('Role column already exists in users table.');
    }
} catch (error) {
    console.error('Error adding role column:', error);
}

// Create or update the three required users with specific roles
async function createOrUpdateUser(username: string, email: string, password: string, role: string) {
    try {
        const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username) as { id: number } | undefined;
        const passwordHash = await bcrypt.hash(password, 10);
        
        if (existingUser) {
            console.log(`Updating user ${username} with role ${role}...`);
            db.prepare('UPDATE users SET email = ?, password_hash = ?, role = ? WHERE id = ?')
              .run(email, passwordHash, role, existingUser.id);
        } else {
            console.log(`Creating new user ${username} with role ${role}...`);
            db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)')
              .run(username, email, passwordHash, role);
        }
    } catch (error) {
        console.error(`Error creating/updating user ${username}:`, error);
    }
}

// Create or update the required users
async function setupUsers() {
    await createOrUpdateUser('admin', 'admin@sokoniconnect.com', 'admin123', 'admin');
    await createOrUpdateUser('trader', 'trader@sokoniconnect.com', 'trader123', 'trader');
    await createOrUpdateUser('reports', 'reports@sokoniconnect.com', 'reports123', 'administrator');
    
    // Verify users and roles
    const users = db.prepare('SELECT id, username, email, role FROM users').all();
    console.table(users);
    
    console.log('Users with roles set up successfully!');
}

setupUsers();
