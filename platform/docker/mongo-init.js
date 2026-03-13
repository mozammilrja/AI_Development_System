// MongoDB initialization script
// This runs when the container starts for the first time

// Switch to the chathub database
db = db.getSiblingDB('chathub');

// Create collections with indexes
db.createCollection('users');
db.createCollection('conversations');
db.createCollection('messages');
db.createCollection('presences');
db.createCollection('encryptionkeys');

// Create indexes for users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

// Create indexes for conversations
db.conversations.createIndex({ 'members.userId': 1 });
db.conversations.createIndex({ dmParticipants: 1 });
db.conversations.createIndex({ type: 1, isPublic: 1 });
db.conversations.createIndex({ 'lastMessage.timestamp': -1 });
db.conversations.createIndex({ createdAt: 1 });

// Create indexes for messages
db.messages.createIndex({ conversationId: 1, createdAt: -1 });
db.messages.createIndex({ conversationId: 1, _id: -1 });
db.messages.createIndex({ senderId: 1, createdAt: -1 });
db.messages.createIndex({ 'replyTo.messageId': 1 });
db.messages.createIndex({ threadRoot: 1, createdAt: 1 });
db.messages.createIndex({ 'mentions.users': 1, createdAt: -1 });

// Create indexes for presence
db.presences.createIndex({ userId: 1 }, { unique: true });
db.presences.createIndex({ status: 1 });
db.presences.createIndex({ lastSeen: -1 });

// Create indexes for encryption keys
db.encryptionkeys.createIndex({ userId: 1, type: 1, keyId: 1 }, { unique: true });
db.encryptionkeys.createIndex({ userId: 1, type: 1, used: 1 });
db.encryptionkeys.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('MongoDB initialization completed successfully!');
