# ACP WebSocket Bridge Server

This server bridges WebSocket connections from web browsers to ACP agents (Claude Code, Gemini CLI, etc.) running via stdio.

## Quick Start

```bash
# Start the server
node acp-websocket-server.js

# Or use npm script
pnpm run acp:server

# Custom port
PORT=8080 node acp-websocket-server.js
```

## How It Works

The server:
1. Accepts WebSocket connections from browsers
2. Spawns agent processes on demand
3. Forwards JSON-RPC messages between WebSocket and agent stdio
4. Handles agent process lifecycle

## Protocol Flow

```
Browser               Server                Agent
  |                     |                     |
  |-- WS Connect ------>|                     |
  |                     |                     |
  |-- spawn_agent ----->|-- spawn process --->|
  |                     |                     |
  |-- initialize ------>|-- forward --------->|
  |                     |                     |
  |<------------------- |<-----response ------| 
  |                     |                     |
  |-- prompt ---------->|-- forward --------->|
  |                     |                     |
  |<-- updates ---------|<----- updates ------|
```

## Message Format

### Spawn Agent Request
```json
{
  "type": "spawn_agent",
  "config": {
    "command": "claude-code",
    "args": [],
    "env": {},
    "cwd": "/workspace"
  }
}
```

### ACP Messages
All other messages are standard ACP JSON-RPC:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": { ... }
}
```

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3001)

### Security Considerations

For production:

1. **Add authentication:**
   ```javascript
   ws.on('connection', (ws, req) => {
     const token = req.headers.authorization;
     if (!validateToken(token)) {
       ws.close(1008, 'Unauthorized');
       return;
     }
     // ... rest of code
   });
   ```

2. **Add CORS/Origin checking:**
   ```javascript
   ws.on('connection', (ws, req) => {
     const origin = req.headers.origin;
     if (!allowedOrigins.includes(origin)) {
       ws.close(1008, 'Origin not allowed');
       return;
     }
   });
   ```

3. **Rate limiting:**
   ```javascript
   import rateLimit from 'express-rate-limit';
   // Add rate limiting middleware
   ```

4. **Process resource limits:**
   ```javascript
   const agentProcess = spawn(command, args, {
     stdio: ['pipe', 'pipe', 'inherit'],
     // Add resource limits
     timeout: 300000, // 5 minutes
     maxBuffer: 10 * 1024 * 1024, // 10MB
   });
   ```

## Monitoring

Add logging for production:

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log connections
wss.on('connection', (ws) => {
  logger.info('New connection', { clientId: ws.id });
});

// Log agent spawns
logger.info('Spawning agent', { command, args });
```

## Error Handling

The server handles:
- WebSocket connection errors
- Agent process spawn failures
- Invalid JSON messages
- Agent process crashes
- WebSocket disconnections

Errors are logged to stderr and sent to the client when appropriate.

## Testing

### Test with wscat

```bash
# Install wscat
npm install -g wscat

# Connect to server
wscat -c ws://localhost:3001

# Send spawn request
{"type":"spawn_agent","config":{"command":"echo","args":["test"]}}

# Send ACP initialize
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":1}}
```

### Test with curl

Check server is running:
```bash
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: test" \
  -H "Sec-WebSocket-Version: 13" \
  http://localhost:3001/
```

## Deployment

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY server/ ./server/
EXPOSE 3001
CMD ["node", "server/acp-websocket-server.js"]
```

### systemd Service

```ini
[Unit]
Description=ACP WebSocket Bridge
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/acp-bridge
ExecStart=/usr/bin/node /opt/acp-bridge/server/acp-websocket-server.js
Restart=on-failure
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

## Troubleshooting

### Port already in use
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Agent not spawning
```bash
# Check agent is in PATH
which claude-code

# Test agent manually
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":1}}' | claude-code
```

### WebSocket connection refused
```bash
# Check server is running
ps aux | grep acp-websocket-server

# Check firewall
sudo ufw status
```

## License

MIT
