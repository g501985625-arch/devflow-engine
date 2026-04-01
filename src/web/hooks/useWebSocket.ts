import { useState, useEffect, useCallback, useRef } from 'react';
import type { AutomationEvent } from '../types';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (event: AutomationEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessage: AutomationEvent | null;
  sendMessage: (data: unknown) => void;
  reconnect: () => void;
  disconnect: () => void;
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<AutomationEvent | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnecting) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onOpen?.();
        console.log('[WebSocket] Connected to', url);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(event.data) as AutomationEvent;
          setLastMessage(data);
          onMessage?.(data);
        } catch (e) {
          console.error('[WebSocket] Failed to parse message:', e);
        }
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        setIsConnecting(false);
        onClose?.();
        console.log('[WebSocket] Disconnected:', event.code, event.reason);

        // Attempt reconnect if enabled
        if (
          reconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          console.log(
            `[WebSocket] Reconnecting in ${reconnectInterval}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect();
            }
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Maximum reconnection attempts reached');
        }
      };

      ws.onerror = (err) => {
        if (!mountedRef.current) return;
        setError('WebSocket connection error');
        onError?.(err);
        console.error('[WebSocket] Error:', err);
      };
    } catch (err) {
      setIsConnecting(false);
      setError('Failed to create WebSocket connection');
      console.error('[WebSocket] Failed to create connection:', err);
    }
  }, [
    url,
    isConnecting,
    reconnect,
    reconnectInterval,
    maxReconnectAttempts,
    onOpen,
    onClose,
    onError,
    onMessage,
  ]);

  const disconnect = useCallback(() => {
    clearReconnectTimeout();
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, [clearReconnectTimeout, maxReconnectAttempts]);

  const reconnectManual = useCallback(() => {
    clearReconnectTimeout();
    reconnectAttemptsRef.current = 0;
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual reconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    // Small delay before reconnecting
    setTimeout(() => {
      if (mountedRef.current) {
        connect();
      }
    }, 100);
  }, [clearReconnectTimeout, connect]);

  const sendMessage = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send message - not connected');
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      clearReconnectTimeout();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
        wsRef.current = null;
      }
    };
  }, [connect, clearReconnectTimeout]);

  return {
    isConnected,
    isConnecting,
    error,
    lastMessage,
    sendMessage,
    reconnect: reconnectManual,
    disconnect,
  };
}

export default useWebSocket;