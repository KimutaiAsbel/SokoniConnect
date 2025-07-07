import db from './database';

console.log('Updating markets to Kenya locations...');

// Update markets with Kenyan names
const updateMarket = db.prepare('UPDATE markets SET name = ?, location = ?, description = ? WHERE id = ?');

// Update to Kenya locations
updateMarket.run('Kapsabet Market', 'Kapsabet, Nandi', 'Main marketplace in Kapsabet town center', 1);
updateMarket.run('Nandi Hills Market', 'Nandi Hills, Nandi', 'Community market serving Nandi Hills', 2);
updateMarket.run('Mosoriot Market', 'Mosoriot, Nandi', 'Fresh produce market in Mosoriot', 3);

// Verify updates
const markets = db.prepare('SELECT * FROM markets').all();
console.table(markets);

console.log('Markets updated successfully!');
