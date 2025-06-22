// minimal_server_test.js
import http from 'http'; // ES6 import syntax for http module

const testPort = 5001; // Use a new, unique port to avoid any lingering conflicts
const hostname = '127.0.0.1'; // Explicitly bind to loopback IP

const server = http.createServer((req, res) => {
    console.log(`Request received for: ${req.url}`); // Log the incoming request
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello from the absolute bare bones Node.js HTTP server (ESM)!\n');
});

server.listen(testPort, hostname, () => {
    console.log(`Minimal ESM server running at http://<span class="math-inline">\{hostname\}\:</span>{testPort}/`);
    console.log(`Try visiting http://<span class="math-inline">\{hostname\}\:</span>{testPort}/ in your browser`);
    console.log(`Or running curl http://<span class="math-inline">\{hostname\}\:</span>{testPort}/ in a new terminal`);

});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`ERROR: Port ${testPort} is already in use. Try a different port.`);
    } else {
        console.error('Server experienced an unhandled error:', e);
    }
});

// Add a listener for unhandled rejections to catch more errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Add a listener for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1); // Exit process after uncaught exception
});