const fs = require('fs');
const path = require('path');

// Read the server.ts file
const serverPath = path.join(__dirname, 'server.ts');
let content = fs.readFileSync(serverPath, 'utf8');

// Find the proper end of the file by looking for the export statement
const exportIndex = content.lastIndexOf('export default app;');
if (exportIndex !== -1) {
    // Trim everything after the export statement plus a newline
    content = content.substring(0, exportIndex + 'export default app;'.length + 1);
    fs.writeFileSync(serverPath, content, 'utf8');
    console.log('Server.ts file fixed successfully.');
} else {
    console.log('Could not find the export statement in the file.');
}
