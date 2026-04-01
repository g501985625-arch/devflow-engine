/**
 * DevFlow Engine - WebSocket 实时推送
 */

import type { FastifyInstance } from 'fastify';
import type { WebSocket } from 'ws';
import type { DevFlowEngine } from '../core/Engine.js';
import type { AutomationEvent } from '../automation/types.js';
import type { WsEvent, WsMessage } from './types.js';

// WebSocket 客户端集合
const clients: Set<WebSocket> = new Set();

/**
 * 设置 WebSocket
 */
export function setupWebSocket(fastify: FastifyInstance, engine: DevFlowEngine): void {
  fastify.register(async (fastifyInstance) => {
    fastifyInstance.get('/ws', { websocket: true }, (connection) => {
      const socket = connection.socket;

      // 添加客户端
      clients.add(socket);

      // 发送欢迎消息
      sendToClient(socket, {
        type: 'connected',
        timestamp: new Date().toISOString(),
        data: {
          message: 'Connected to DevFlow Engine',
          initialized: engine.isInitialized(),
        },
      });

      // 心跳
      const heartbeatInterval = setInterval(() => {
        if (socket.readyState === socket.OPEN) {
          sendToClient(socket, {
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
          });
        }
      }, 30000);

      // 监听消息
      socket.on('message', (rawMessage: Buffer) => {
        try {
          const message: WsMessage = JSON.parse(rawMessage.toString());

          handleClientMessage(socket, message, engine);
        } catch (error) {
          sendToClient(socket, {
            type: 'error',
            timestamp: new Date().toISOString(),
            data: {
              message: 'Invalid message format',
            },
          });
        }
      });

      // 关闭连接
      socket.on('close', () => {
        clients.delete(socket);
        clearInterval(heartbeatInterval);
      });

      // 错误处理
      socket.on('error', () => {
        clients.delete(socket);
        clearInterval(heartbeatInterval);
      });
    });
  });
}

/**
 * 处理客户端消息
 */
function handleClientMessage(
  socket: WebSocket,
  message: WsMessage,
  engine: DevFlowEngine
): void {
  switch (message.type) {
    case 'ping':
      sendToClient(socket, {
        type: 'pong',
        timestamp: new Date().toISOString(),
      });
      break;

    case 'subscribe':
      // 订阅特定项目事件
      sendToClient(socket, {
        type: 'subscribed',
        timestamp: new Date().toISOString(),
        data: {
          projectId: message.projectId,
        },
      });
      break;

    case 'get_status':
      // 获取当前状态
      if (engine.isInitialized()) {
        sendToClient(socket, {
          type: 'status',
          timestamp: new Date().toISOString(),
          data: engine.getState(),
        });
      }
      break;

    default:
      sendToClient(socket, {
        type: 'error',
        timestamp: new Date().toISOString(),
        data: {
          message: `Unknown message type: ${message.type}`,
        },
      });
  }
}

/**
 * 发送消息到单个客户端
 */
function sendToClient(socket: WebSocket, event: WsEvent): void {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(event));
  }
}

/**
 * 广播事件到所有客户端
 */
export function broadcastEvent(event: WsEvent): void {
  const message = JSON.stringify(event);

  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}

/**
 * 广播 Automation 事件
 */
export function broadcastAutomationEvent(automationEvent: AutomationEvent): void {
  broadcastEvent({
    type: automationEvent.type,
    timestamp: new Date().toISOString(),
    data: automationEvent,
  });
}

/**
 * 获取客户端数量
 */
export function getClientCount(): number {
  return clients.size;
}