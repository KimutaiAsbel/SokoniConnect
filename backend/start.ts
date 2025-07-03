import { exec } from 'child_process';
import path from 'path';

const serverPath = path.join(__dirname, 'server.ts');

console.log('🚀 Starting Sokoni Connect Backend Server...');
console.log('📁 Server file:', serverPath);

// Use ts-node to run the TypeScript server directly
const command = `npx ts-node "${serverPath}"`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Error starting server:', error);
        return;
    }
    if (stderr) {
        console.error('⚠️ Server stderr:', stderr);
    }
    console.log('✅ Server output:', stdout);
});
