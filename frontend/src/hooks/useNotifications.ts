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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

      // Extract user ID from localStorage decoded info or parse from helper if needed
      let userId: string | null = null;
      try {
        const storedUser = localStorage.getItem('nexushr_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          // Wait, let's see how user ID is represented. The User interface in api.ts has: token, fullName, email, role.
          // Since the API login response returns the User object, let's look at the JWT payload or parse standard login response.
          // In Java backend, the user ID is a Long. Let's see if the token contains the ID, or if we can extract it or use a default channel.
          // Wait, the backend pushes messages using: messagingTemplate.convertAndSendToUser(user.getId().toString(), "/queue/notifications", savedDto)
          // So the user destination name is user.getId().toString() or user.getEmail().
          // Wait, let's verify how user ID or principal is determined in Spring Security.
          // In Spring Security with JWT, the Principal name is usually the username (email).
          // Let's check how the JWT principal is resolved or how user.getId().toString() is mapped.
          // Wait, let's see. Spring Security's SimpMessagingTemplate resolves user destination based on the Principal's name.
          // Let's look at where security resolves principal or if we can just subscribe to the user's destination.
        }
      } catch (e) {
        console.error('Failed to parse user session info', e);
      }

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
