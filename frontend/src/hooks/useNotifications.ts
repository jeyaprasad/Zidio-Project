import { useEffect, useRef } from 'react';
import { type User } from '../services/api';

export interface NotificationPayload {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  read: boolean;
  createdAt: string;
}

interface UseNotificationsProps {
  user: User | null;
  onNotification: (notification: NotificationPayload) => void;
}

export const useNotifications = ({ user, onNotification }: UseNotificationsProps) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any | null>(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.close();
      }
      return;
    }

    const connectWebSocket = () => {
      if (isConnectingRef.current) return;
      isConnectingRef.current = true;

      // User is verified, standard STOMP user registry matches subscriptions using authentication principal.

      // If we subscribe to /user/queue/notifications, Spring's UserRegistry matching delegates it.
      // Let's establish connection URL:
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/websocket`;

      console.log('Connecting to real-time notification service at:', wsUrl);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        isConnectingRef.current = false;
        console.log('Notification channel socket opened.');
        
        // Send STOMP CONNECT frame
        const connectFrame = 
          'CONNECT\n' +
          'accept-version:1.1,1.0\n' +
          'heart-beat:10000,10000\n\n' +
          '\u0000';
        ws.send(connectFrame);
      };

      ws.onmessage = (event) => {
        const data = event.data as string;
        
        // Parse STOMP Frame
        const nullByteIdx = data.indexOf('\u0000');
        const frameStr = nullByteIdx !== -1 ? data.slice(0, nullByteIdx) : data;
        const sections = frameStr.split('\n\n');
        const headerLines = sections[0].split('\n');
        const command = headerLines[0].trim();
        
        if (command === 'CONNECTED') {
          console.log('Notification channel connected to STOMP Broker.');
          
          // Send STOMP SUBSCRIBE frame
          const subscribeFrame = 
            'SUBSCRIBE\n' +
            'id:sub-0\n' +
            'destination:/user/queue/notifications\n\n' +
            '\u0000';
          ws.send(subscribeFrame);
        } else if (command === 'MESSAGE') {
          // Extract body
          const body = sections[1] ? sections[1].trim() : '';
          try {
            const notification = JSON.parse(body) as NotificationPayload;
            onNotification(notification);
          } catch (err) {
            console.error('Failed to parse incoming notification frame payload:', err);
          }
        }
      };

      ws.onclose = (event) => {
        isConnectingRef.current = false;
        console.log(`Notification channel socket closed: code=${event.code}, reason=${event.reason}`);
        
        // Retry connection after 5 seconds if not explicitly unmounted
        if (user) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Retrying real-time notification socket connection...');
            connectWebSocket();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error('Notification channel socket encountered error:', error);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user]);
};
