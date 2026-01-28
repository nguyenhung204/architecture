const http = require('http');

const PORT = 3001;

const server = http.createServer((req, res) => {
  console.log(`[Server 2] Received request: ${req.method} ${req.url}`);
  
  // Tắt keepalive và cache
  res.setHeader('Connection', 'close');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Load Balancer Demo</title>
      <style>
        body { 
          margin: 0; 
          padding: 50px; 
          font-family: Arial, sans-serif; 
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          flex-direction: column;
        }
        .container {
          background: rgba(255,255,255,0.1);
          padding: 40px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          text-align: center;
        }
        h1 { font-size: 3em; margin: 0 0 20px 0; }
        p { font-size: 1.5em; margin: 10px 0; }
        .info { font-size: 1em; opacity: 0.8; margin-top: 20px; }
        button { 
          margin-top: 30px; 
          padding: 15px 30px; 
          font-size: 1.2em; 
          background: white; 
          color: #f5576c; 
          border: none; 
          border-radius: 8px; 
          cursor: pointer;
          font-weight: bold;
        }
        button:hover { background: #f0f0f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>SERVER 2</h1>
        <p>Port: ${PORT}</p>
        <p>Hello from Server 2!</p>
        <p class="info">Time: ${new Date().toLocaleString('vi-VN')}</p>
        <button onclick="location.reload()">Refresh để thấy Load Balancing</button>
      </div>
    </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Server 2 is running on http://localhost:${PORT}`);
});
