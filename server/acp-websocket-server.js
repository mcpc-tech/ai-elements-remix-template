#!/usr/bin/env node

/**
 * WebSocket-to-stdio bridge for ACP agents
 * 
 * This server allows web clients to connect to ACP agents (like Claude Code or Gemini CLI)
 * by bridging WebSocket connections to the agent's stdin/stdout.
 * 
 * Usage:
 *   node acp-websocket-server.js --port 3001
 */

import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';

const PORT = process.env.PORT || 3001;

const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 ACP WebSocket Server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('📡 New WebSocket connection');

  let agentProcess = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      // Handle agent spawn request
      if (message.type === 'spawn_agent') {
        const { command, args = [], env = {}, cwd } = message.config;

        console.log(`🤖 Spawning agent: ${command} ${args.join(' ')}`);

        // Spawn the agent process
        agentProcess = spawn(command, args, {
          stdio: ['pipe', 'pipe', 'inherit'],
          env: { ...process.env, ...env },
          cwd: cwd || process.cwd(),
        });

        // Forward agent stdout to WebSocket
        agentProcess.stdout.on('data', (chunk) => {
          const lines = chunk.toString().split('\n');
          for (const line of lines) {
            if (line.trim()) {
              try {
                // Validate it's valid JSON-RPC before sending
                const parsed = JSON.parse(line);
                // Only forward valid JSON-RPC messages
                if (parsed.jsonrpc === '2.0') {
                  console.log(`← Received from agent: ${parsed.method || parsed.result ? 'response' : 'notification'}`);
                  ws.send(line);
                } else {
                  console.log('Non JSON-RPC output from agent:', line);
                }
              } catch (err) {
                // Agent outputted non-JSON text (initialization messages, etc.)
                console.log('Non-JSON output from agent:', line);
              }
            }
          }
        });

        // Handle agent process errors
        agentProcess.on('error', (error) => {
          console.error('Agent process error:', error);
          ws.send(JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Agent process error',
              data: { error: error.message },
            },
          }));
        });

        // Handle agent process exit
        agentProcess.on('exit', (code, signal) => {
          console.log(`Agent process exited with code ${code}, signal ${signal}`);
          ws.close();
        });
      } else {
        // Forward JSON-RPC messages to agent stdin
        if (agentProcess && agentProcess.stdin) {
          // Ensure message is valid JSON-RPC format
          if (message.jsonrpc === '2.0' && (message.method || message.result !== undefined || message.error)) {
            console.log(`→ Forwarding to agent: ${message.method || 'response'}`);
            agentProcess.stdin.write(JSON.stringify(message) + '\n');
          } else {
            console.warn('Invalid message format, ignoring:', message);
          }
        } else {
          console.warn('Cannot forward message: agent process not ready');
        }
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  ws.on('close', () => {
    console.log('📡 WebSocket connection closed');
    if (agentProcess) {
      agentProcess.kill();
      agentProcess = null;
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  wss.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
