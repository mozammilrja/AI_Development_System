import { useState, useRef, useEffect, useCallback, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useSendMessage, useTypingIndicator, useUploadMedia } from '../../hooks/useChat';
import { useSocket } from '../../hooks/useSocket';

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { replyingTo, setReplyingTo } = useChatStore();
  const sendMessage = useSendMessage();
  const uploadMedia = useUploadMedia();

  const token = localStorage.getItem('token');
  const { startTyping, stopTyping } = useSocket(token);
  const { handleTyping, handleStopTyping } = useTypingIndicator(
    conversationId,
    startTyping,
    stopTyping
  );

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [text]);

  // Focus on reply
  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  const handleSend = useCallback(async () => {
    if (!text.trim() && files.length === 0) return;

    handleStopTyping();

    try {
      if (files.length > 0) {
        await uploadMedia.mutateAsync({ conversationId, files });
        setFiles([]);
      }

      if (text.trim()) {
        await sendMessage.mutateAsync({
          conversationId,
          type: 'text',
          content: { text: text.trim() },
          replyTo: replyingTo?._id,
        });
      }

      setText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [text, files, conversationId, replyingTo, handleStopTyping, uploadMedia, sendMessage, setReplyingTo]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Reply preview */}
      {replyingTo && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-100 p-2">
          <div className="flex-1">
            <p className="text-xs text-gray-500">
              Replying to{' '}
              <span className="font-medium">
                {typeof replyingTo.senderId === 'string'
                  ? 'User'
                  : replyingTo.senderId.name}
              </span>
            </p>
            <p className="truncate text-sm text-gray-700">
              {replyingTo.content.text || '[Media]'}
            </p>
          </div>
          <button
            onClick={cancelReply}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            aria-label="Cancel reply"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2"
            >
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
              <span className="max-w-[100px] truncate text-sm">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                aria-label={`Remove ${file.name}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Attach file"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Text input */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleStopTyping}
            placeholder="Type a message..."
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={1}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() && files.length === 0}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          aria-label="Send message"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
