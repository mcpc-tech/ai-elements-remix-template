import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ClientSideConnection,
  Client,
  Agent,
  SessionNotification,
  RequestPermissionRequest,
  RequestPermissionResponse,
  WriteTextFileRequest,
  WriteTextFileResponse,
  ReadTextFileRequest,
  ReadTextFileResponse,
  PROTOCOL_VERSION,
  type Stream,
  type AnyMessage,
} from '@agentclientprotocol/sdk';

/**
 * Creates a WebSocket-based ACP Stream for browser communication
 * This replaces the stdio-based ndJsonStream with WebSocket transport
 */
function createWebSocketStream(ws: WebSocket): Stream {
  // Create a readable stream from WebSocket messages
  const readable = new ReadableStream<AnyMessage>({
    start(controller) {
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as AnyMessage;
          controller.enqueue(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', event.data, err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        controller.error(error);
      };

      ws.onclose = () => {
        controller.close();
      };
    },
  });

  // Create a writable stream that sends messages to WebSocket
  const writable = new WritableStream<AnyMessage>({
    async write(message) {
      if (ws.readyState === WebSocket.OPEN) {
        const content = JSON.stringify(message);
        ws.send(content);
      } else {
        throw new Error('WebSocket is not open');
      }
    },
    close() {
      ws.close();
    },
  });

  return { readable, writable };
}

/**
 * Type for agent process configuration
 */
export interface AgentProcessConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
}

/**
 * Message received from agent
 */
export interface AgentMessage {
  type: 'user' | 'text' | 'tool_call' | 'tool_call_update' | 'plan' | 'error';
  content: string;
  timestamp: number;
  metadata?: {
    toolCallId?: string;
    toolName?: string;
    status?: string | null;
    input?: Record<string, unknown>;
    output?: unknown;
  };
}

/**
 * Connection status
 */
export type ConnectionStatus = 
  | 'disconnected' 
  | 'connecting' 
  | 'connected' 
  | 'authenticating'
  | 'ready'
  | 'error';

/**
 * Web-based ACP Client implementation
 * This handles incoming requests from the agent
 */
class WebACPClient implements Client {
  private onSessionUpdateCallback?: (notification: SessionNotification) => void;
  private onPermissionRequestCallback?: (
    request: RequestPermissionRequest
  ) => Promise<RequestPermissionResponse>;

  setSessionUpdateHandler(handler: (notification: SessionNotification) => void) {
    this.onSessionUpdateCallback = handler;
  }

  setPermissionRequestHandler(
    handler: (request: RequestPermissionRequest) => Promise<RequestPermissionResponse>
  ) {
    this.onPermissionRequestCallback = handler;
  }

  async sessionUpdate(params: SessionNotification): Promise<void> {
    if (this.onSessionUpdateCallback) {
      this.onSessionUpdateCallback(params);
    }
  }

  async requestPermission(
    params: RequestPermissionRequest
  ): Promise<RequestPermissionResponse> {
    if (this.onPermissionRequestCallback) {
      return await this.onPermissionRequestCallback(params);
    }
    // Default: reject permission
    return {
      outcome: {
        outcome: 'cancelled',
      },
    };
  }

  async writeTextFile(
    params: WriteTextFileRequest
  ): Promise<WriteTextFileResponse> {
    console.log('Write file request:', params);
    throw new Error('File operations not implemented in browser client');
  }

  async readTextFile(
    params: ReadTextFileRequest
  ): Promise<ReadTextFileResponse> {
    console.log('Read file request:', params);
    throw new Error('File operations not implemented in browser client');
  }
}

/**
 * Hook for managing ACP agent connection from the browser
 */
export function useACPAgent() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const agentRef = useRef<Agent | null>(null);
  const clientRef = useRef<WebACPClient | null>(null);
  const assistantMessageIndexRef = useRef<number | null>(null);
  const accumulatedTextRef = useRef<string>('');

  /**
   * Connect to an ACP agent via WebSocket proxy
   * The WebSocket server should spawn the agent process and bridge stdio
   */
  const connect = useCallback(async (wsUrl: string, agentConfig: AgentProcessConfig) => {
    try {
      setStatus('connecting');
      setError(null);

      // Create WebSocket connection
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Wait for WebSocket to open
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => resolve();
        ws.onerror = (error) => reject(error);
      });

      // Create ACP client
      const client = new WebACPClient();
      clientRef.current = client;

      // Create stream from WebSocket
      const stream = createWebSocketStream(ws);

      // Create ACP connection
      const connection = new ClientSideConnection(
        () => client,
        stream
      );
      agentRef.current = connection;

      // Send agent configuration to WebSocket server
      ws.send(JSON.stringify({
        type: 'spawn_agent',
        config: agentConfig,
      }));

      // Wait a bit for agent to start
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Initialize the ACP connection
      setStatus('authenticating');
      console.log('Sending initialize request...');
      
      const initResult = await Promise.race([
        connection.initialize({
          protocolVersion: PROTOCOL_VERSION,
          clientCapabilities: {
            fs: {
              readTextFile: false, // Disabled for browser security
              writeTextFile: false,
            },
          },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialize timeout after 10s')), 10000)
        )
      ]);

      console.log('Agent initialized:', initResult);

      // Create a new session
      console.log('Creating new session...');
      const sessionResult = await Promise.race([
        connection.newSession({
          cwd: agentConfig.cwd || '/workspace',
          mcpServers: [],
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('New session timeout after 10s')), 10000)
        )
      ]);

      setSessionId(sessionResult.sessionId);
      setStatus('ready');

      console.log('Session created:', sessionResult.sessionId);
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  }, []);

  /**
   * Send a prompt to the agent
   */
  const sendPrompt = useCallback(async (text: string) => {
    if (!agentRef.current || !sessionId) {
      throw new Error('Not connected to agent');
    }

    try {
      // Add user message first
      setMessages((prev) => [
        ...prev,
        {
          type: 'user',
          content: text,
          timestamp: Date.now(),
        },
      ]);

      // Reset tracking variables for new prompt
      assistantMessageIndexRef.current = null;
      accumulatedTextRef.current = '';
      const toolCallsMap = new Map<string, number>(); // toolCallId -> message index

      // Set up session update handler
      if (clientRef.current) {
        clientRef.current.setSessionUpdateHandler((notification) => {
          const update = notification.update;
          console.log('Session update:', update.sessionUpdate, update);

          switch (update.sessionUpdate) {
            case 'agent_message_chunk':
              if (update.content.type === 'text') {
                const textChunk = 'text' in update.content ? update.content.text : '';
                console.log('Text chunk received:', textChunk);
                accumulatedTextRef.current += textChunk;

                setMessages((prev) => {
                  console.log('setMessages called, prev length:', prev.length, 'assistantMessageIndex:', assistantMessageIndexRef.current);
                  const newMessages = [...prev];
                  
                  if (assistantMessageIndexRef.current === null) {
                    // Create new assistant message
                    assistantMessageIndexRef.current = prev.length; // Use prev.length, not newMessages.length
                    console.log('Creating new assistant message at index:', assistantMessageIndexRef.current);
                    newMessages.push({
                      type: 'text',
                      content: accumulatedTextRef.current,
                      timestamp: Date.now(),
                    });
                  } else {
                    // Update existing assistant message - check bounds using prev array
                    console.log('Updating assistant message at index:', assistantMessageIndexRef.current);
                    if (assistantMessageIndexRef.current < prev.length) {
                      // Message exists in prev state, update it
                      newMessages[assistantMessageIndexRef.current] = {
                        ...prev[assistantMessageIndexRef.current],
                        content: accumulatedTextRef.current,
                      };
                    } else {
                      // Message doesn't exist yet (race condition), recreate it
                      console.log('Message not found at index, recreating at index:', newMessages.length);
                      assistantMessageIndexRef.current = newMessages.length;
                      newMessages.push({
                        type: 'text',
                        content: accumulatedTextRef.current,
                        timestamp: Date.now(),
                      });
                    }
                  }
                  
                  console.log('Returning newMessages, length:', newMessages.length);
                  return newMessages;
                });
              }
              break;

            case 'tool_call':
              {
                const toolCallId = update.toolCallId;
                const toolName = update.title || 'unknown-tool';
                
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const newIndex = newMessages.length;
                  toolCallsMap.set(toolCallId, newIndex);
                  
                  newMessages.push({
                    type: 'tool_call',
                    content: `Calling ${toolName}...`,
                    timestamp: Date.now(),
                    metadata: {
                      toolCallId,
                      toolName: `tool-${toolName}`,
                      status: update.status,
                      input: update.content && update.content.length > 0 ? update.content[0] : undefined,
                    },
                  });
                  
                  return newMessages;
                });
              }
              break;

            case 'tool_call_update':
              {
                const toolCallId = update.toolCallId;
                const messageIndex = toolCallsMap.get(toolCallId);
                
                if (messageIndex !== undefined) {
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const existingMsg = newMessages[messageIndex];
                    
                    if (existingMsg) {
                      newMessages[messageIndex] = {
                        ...existingMsg,
                        type: 'tool_call_update',
                        content: update.status === 'failed' 
                          ? `Tool call failed: ${JSON.stringify(update.content)}`
                          : `Tool completed`,
                        metadata: {
                          ...existingMsg.metadata,
                          status: update.status,
                          output: update.content && update.content.length > 0 ? update.content[0] : undefined,
                        },
                      };
                    }
                    
                    return newMessages;
                  });
                }
              }
              break;
          }
        });

        // Set up permission request handler
        clientRef.current.setPermissionRequestHandler(async (request) => {
          // In a real app, this would show a UI dialog
          console.log('Permission request:', request);
          // Auto-approve for now
          return {
            outcome: {
              outcome: 'selected',
              optionId: request.options[0]?.optionId || 'allow',
            },
          };
        });
      }

      // Send the prompt
      const result = await agentRef.current.prompt({
        sessionId,
        prompt: [
          {
            type: 'text',
            text,
          },
        ],
      });

      console.log('Prompt completed:', result.stopReason);
      
      // Don't reset refs here! WebSocket events may still be processing.
      // Refs will be reset at the start of the next prompt in sendPrompt().
    } catch (err) {
      console.error('Prompt error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          content: err instanceof Error ? err.message : 'Unknown error',
          timestamp: Date.now(),
        },
      ]);
    }
  }, [sessionId]);

  /**
   * Cancel ongoing operation
   */
  const cancel = useCallback(async () => {
    if (!agentRef.current || !sessionId) {
      return;
    }

    try {
      await agentRef.current.cancel({ sessionId });
    } catch (err) {
      console.error('Cancel error:', err);
    }
  }, [sessionId]);

  /**
   * Disconnect from agent
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    agentRef.current = null;
    clientRef.current = null;
    setSessionId(null);
    setStatus('disconnected');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    messages,
    error,
    sessionId,
    connect,
    sendPrompt,
    cancel,
    disconnect,
  };
}
