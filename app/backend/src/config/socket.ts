import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import jwt from 'jsonwebtoken';
import { getPubClient, getSubClient, setUserOnline, setUserOffline } from './redis.js';
import { env } from './env.js';
import { Presence } from '../models/Presence.js';
import { Conversation } from '../models/Conversation.js';
import { ReadReceiptService } from '../services/chat/readReceipt.service.js';
import { Types } from 'mongoose';

// Extended Socket with user data
interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
}

// Event handlers
export interface ServerToClientEvents {
  // Messages
  'message:new': (message: any) => void;
  'message:edited': (data: { messageId: string; content: string; editedAt: string }) => void;
  'message:deleted': (data: { messageId: string; deletedAt: string }) => void;
  'message:reaction': (data: { messageId: string; reactions: any[] }) => void;
  
  // Typing
  'typing:start': (data: { conversationId: string; userId: string; userName: string }) => void;
  'typing:stop': (data: { conversationId: string; userId: string }) => void;
  
  // Presence
  'presence:update': (data: { userId: string; status: string; lastSeen?: string }) => void;
  
  // Read receipts
  'message:read': (data: { conversationId: string; userId: string; messageId: string }) => void;
  
  // Conversation
  'conversation:update': (conversation: any) => void;
  'conversation:member_added': (data: { conversationId: string; member: any }) => void;
  'conversation:member_removed': (data: { conversationId: string; userId: string }) => void;
  
  // Calls
  'call:incoming': (data: any) => void;
  'call:answered': (data: any) => void;
  'call:ended': (data: any) => void;
  'call:participant_joined': (data: any) => void;
  'call:participant_left': (data: any) => void;
  
  // Errors
  'error': (error: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  // Messages
  'message:send': (data: { conversationId: string; content: any; type: string; replyTo?: string }) => void;
  'message:edit': (data: { messageId: string; content: string }) => void;
  'message:delete': (data: { messageId: string }) => void;
  'message:react': (data: { messageId: string; emoji: string }) => void;
  
  // Typing
  'typing:start': (data: { conversationId: string }) => void;
  'typing:stop': (data: { conversationId: string }) => void;
  
  // Presence
  'presence:update': (data: { status: string; customMessage?: string }) => void;
  
  // Read receipts
  'message:mark_read': (data: { conversationId: string; messageId: string }) => void;
  
  // Conversations
  'conversation:join': (conversationId: string) => void;
  'conversation:leave': (conversationId: string) => void;
  
  // Calls
  'call:start': (data: { conversationId: string; type: 'audio' | 'video' }) => void;
  'call:answer': (data: { callId: string }) => void;
  'call:reject': (data: { callId: string }) => void;
  'call:end': (data: { callId: string }) => void;
}

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

export const initializeSocket = async (httpServer: HttpServer): Promise<Server> => {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Set up Redis adapter for horizontal scaling
  try {
    const pubClient = await getPubClient();
    const subClient = await getSubClient();
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.IO Redis adapter initialized');
  } catch (error) {
    console.warn('Redis adapter not available, using in-memory adapter:', error);
  }

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, env.jwtSecret) as { id: string; email: string; role: string };
      socket.userId = decoded.id;
      socket.userName = decoded.email;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const userName = socket.userName!;
    
    console.log(`User connected: ${userId} (${socket.id})`);

    // Update presence
    try {
      await setUserOnline(userId, socket.id);
      await Presence.connect(
        new Types.ObjectId(userId),
        socket.id,
        'web',
        socket.handshake.headers['user-agent']
      );
    } catch (error) {
      console.error('Error updating presence:', error);
    }

    // Join user's conversation rooms
    try {
      const conversations = await Conversation.find({ 'members.userId': userId }).select('_id');
      conversations.forEach((conv) => {
        socket.join(`conversation:${conv._id}`);
      });
    } catch (error) {
      console.error('Error joining rooms:', error);
    }

    // Broadcast online status to relevant users
    socket.broadcast.emit('presence:update', { userId, status: 'online' });

    // Handle typing indicators
    socket.on('typing:start', async ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        conversationId,
        userId,
        userName,
      });
    });

    socket.on('typing:stop', async ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId,
      });
    });

    // Handle presence updates
    socket.on('presence:update', async ({ status, customMessage }) => {
      await Presence.setStatus(new Types.ObjectId(userId), status as any, customMessage);
      socket.broadcast.emit('presence:update', { userId, status });
    });

    // Handle read receipts
    socket.on('message:mark_read', async ({ conversationId, messageId }) => {
      try {
        // Use ReadReceiptService for hybrid read receipt handling
        await ReadReceiptService.markAsRead(userId, conversationId, messageId);
        // Note: ReadReceiptService.markAsRead already emits the socket event
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('error', {
          code: 'READ_RECEIPT_ERROR',
          message: 'Failed to mark message as read',
        });
      }
    });

    // Handle conversation room management
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId} (${socket.id})`);
      
      try {
        await setUserOffline(userId);
        const presence = await Presence.disconnect(socket.id);
        
        if (presence && presence.status === 'offline') {
          socket.broadcast.emit('presence:update', {
            userId,
            status: 'offline',
            lastSeen: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error updating presence on disconnect:', error);
      }
    });
  });

  return io;
};

export const getIO = (): Server<ClientToServerEvents, ServerToClientEvents> => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Helper to emit to a conversation
export const emitToConversation = (
  conversationId: string,
  event: keyof ServerToClientEvents,
  data: any
): void => {
  if (io) {
    io.to(`conversation:${conversationId}`).emit(event, data);
  }
};

// Helper to emit to specific users
export const emitToUsers = (
  userIds: string[],
  event: keyof ServerToClientEvents,
  data: any
): void => {
  if (io) {
    userIds.forEach((userId) => {
      io!.to(`user:${userId}`).emit(event, data);
    });
  }
};
