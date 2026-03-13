import { useState, useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useConversations, useCreateConversation } from '../hooks/useChat';
import { useSocket } from '../hooks/useSocket';
import { ConversationList, MessageList, MessageInput, ChatHeader } from '../components/chat';

export function ChatPage() {
  const [showNewChat, setShowNewChat] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // Get current user from localStorage (simplified - should come from auth context)
  const currentUserId = localStorage.getItem('userId') || '';
  const token = localStorage.getItem('token');

  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    setConversations,
  } = useChatStore();

  // Initialize socket connection
  useSocket(token);

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useConversations();

  // Update store when data loads
  useEffect(() => {
    if (conversationsData?.pages) {
      const allConversations = conversationsData.pages.flatMap((page) => page.conversations);
      setConversations(allConversations);
    }
  }, [conversationsData, setConversations]);

  const activeConversation = conversations.find((c) => c._id === activeConversationId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`flex w-full flex-col border-r border-gray-200 bg-white md:w-80 ${
        activeConversationId ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <button
            onClick={() => setShowNewChat(true)}
            className="rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600"
            aria-label="New conversation"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Conversations list */}
        {conversationsLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <svg className="h-6 w-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            currentUserId={currentUserId}
            onSelect={setActiveConversation}
          />
        )}
      </div>

      {/* Main chat area */}
      <div className={`flex flex-1 flex-col ${
        !activeConversationId ? 'hidden md:flex' : 'flex'
      }`}>
        {activeConversation ? (
          <>
            <ChatHeader
              conversation={activeConversation}
              currentUserId={currentUserId}
              onBackClick={() => setActiveConversation(null)}
              onInfoClick={() => setShowInfo(true)}
            />
            <MessageList
              conversationId={activeConversation._id}
              currentUserId={currentUserId}
            />
            <MessageInput conversationId={activeConversation._id} />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="mb-4 rounded-full bg-blue-100 p-6">
              <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Welcome to ChatHub</h2>
            <p className="mb-6 text-center text-gray-500">
              Select a conversation or start a new one
            </p>
            <button
              onClick={() => setShowNewChat(true)}
              className="rounded-lg bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600"
            >
              Start a new conversation
            </button>
          </div>
        )}
      </div>

      {/* New conversation modal */}
      {showNewChat && (
        <NewConversationModal
          onClose={() => setShowNewChat(false)}
          currentUserId={currentUserId}
        />
      )}

      {/* Conversation info sidebar */}
      {showInfo && activeConversation && (
        <ConversationInfoSidebar
          conversation={activeConversation}
          currentUserId={currentUserId}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  );
}

// New conversation modal
function NewConversationModal({ onClose, currentUserId }: { onClose: () => void; currentUserId: string }) {
  const [type, setType] = useState<'dm' | 'group' | 'channel'>('dm');
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ _id: string; name: string; email: string }>>([]);
  const [selectedUsers, setSelectedUsers] = useState<Array<{ _id: string; name: string; email: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Get token from localStorage or auth store
  const getToken = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      // Try to get from zustand persisted store
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed?.state?.tokens?.accessToken || null;
        }
      } catch (e) {
        console.error('Failed to parse auth storage:', e);
      }
    }
    return token;
  };
  const [error, setError] = useState('');

  const createConversation = useCreateConversation();

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const token = getToken();
        if (!token) {
          console.error('No auth token found');
          return;
        }
        const res = await fetch(`http://localhost:3001/api/auth/users/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data?.users) {
          // Filter out already selected users
          const filtered = data.data.users.filter(
            (u: { _id: string }) => !selectedUsers.some(s => s._id === u._id)
          );
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedUsers]);

  const handleSelectUser = (user: { _id: string; name: string; email: string }) => {
    if (type === 'dm') {
      setSelectedUsers([user]);
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    try {
      await createConversation.mutateAsync({
        type,
        name: type !== 'dm' ? name : undefined,
        members: selectedUsers.map(u => u._id),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create conversation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Conversation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Type selector */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
            <div className="flex gap-2">
              {(['dm', 'group', 'channel'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    if (t === 'dm' && selectedUsers.length > 1) {
                      setSelectedUsers(selectedUsers.slice(0, 1));
                    }
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    type === t
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t === 'dm' ? 'Direct' : t === 'group' ? 'Group' : 'Channel'}
                </button>
              ))}
            </div>
          </div>

          {/* Name (for groups/channels) */}
          {type !== 'dm' && (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === 'group' ? 'Group name' : 'Channel name'}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Search users */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {type === 'dm' ? 'Find User' : 'Add Members'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type name or email (min 2 chars)..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="h-4 w-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}
            </div>
            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <p className="mt-1 text-xs text-gray-500">Type at least 2 characters to search</p>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <p className="mt-1 text-xs text-gray-500">No users found. Try "admin" or "demo"</p>
            )}

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {searchResults.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Selected</label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <span
                    key={user._id}
                    className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                  >
                    {user.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(user._id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={selectedUsers.length === 0 || (type !== 'dm' && !name) || createConversation.isPending}
            className="w-full rounded-lg bg-blue-500 py-2 font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {createConversation.isPending ? 'Creating...' : 'Create Conversation'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Conversation info sidebar
function ConversationInfoSidebar({
  conversation,
  currentUserId,
  onClose,
}: {
  conversation: NonNullable<ReturnType<typeof useChatStore.getState>['conversations'][0]>;
  currentUserId: string;
  onClose: () => void;
}) {
  return (
    <div className="w-80 border-l border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="font-semibold">Conversation Info</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {/* Conversation avatar/name */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
            <span className="text-2xl font-medium text-white">
              {conversation.type === 'channel'
                ? '#'
                : (conversation.name || 'C').charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-lg font-semibold">{conversation.name || 'Conversation'}</h3>
          {conversation.description && (
            <p className="text-center text-sm text-gray-500">{conversation.description}</p>
          )}
        </div>

        {/* Members */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-500">
            Members ({conversation.members.length})
          </h4>
          <div className="space-y-2">
            {conversation.members.map((member) => {
              const user = typeof member.userId === 'string'
                ? { _id: member.userId, name: 'User', avatar: undefined }
                : member.userId;
              const isCurrentUser = user._id === currentUserId;

              return (
                <div key={user._id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {user.name}
                      {isCurrentUser && <span className="text-gray-400"> (You)</span>}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
