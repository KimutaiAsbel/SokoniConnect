// Import fetch correctly
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testPing() {
    try {
        console.log('Testing ping endpoint...');
        const response = await fetch('http://localhost:5000/api/auth/ping');
        const data = await response.json();
        console.log('Ping response:', data);
    } catch (error) {
        console.error('Error testing ping:', error);
    }
}

testPing();
