import { useMemo } from 'react';
import { useChatStore } from '../stores/chatStore';
import type { ConversationType } from '../types/chat';

export interface ReadReceiptData {
  status: 'sent' | 'delivered' | 'read';
  readByUserIds: string[];
  readByCount: number;
  displayMode: 'checkmarks' | 'avatars' | 'simple';
}

interface UseReadReceiptsOptions {
  conversationId: string;
  messageId: string;
  conversationType: ConversationType;
  memberCount: number;
  senderId: string;
}

/**
 * Hook to get read receipt data for a message
 * Returns display mode based on conversation type/size:
 * - DM: checkmarks (✓✓)
 * - Small group (≤20): avatar stack
 * - Large group: simple "Read" indicator
 */
export function useReadReceipts({
  conversationId,
  messageId,
  conversationType,
  memberCount,
  senderId,
}: UseReadReceiptsOptions): ReadReceiptData {
  const readReceipts = useChatStore((state) => state.readReceipts);
  const readHorizons = useChatStore((state) => state.readHorizons);

  return useMemo(() => {
    // Get users who have read this specific message
    const convReceipts = readReceipts[conversationId] || {};
    const messageReadBy = convReceipts[messageId] || [];
    
    // Filter out the sender from read receipts
    const readByUserIds = messageReadBy.filter((userId) => userId !== senderId);
    const readByCount = readByUserIds.length;

    // Determine display mode based on conversation type and size
    let displayMode: ReadReceiptData['displayMode'];
    if (conversationType === 'dm') {
      displayMode = 'checkmarks';
    } else if (memberCount <= 20) {
      displayMode = 'avatars';
    } else {
      displayMode = 'simple';
    }

    // Determine status
    let status: ReadReceiptData['status'];
    if (readByCount > 0) {
      status = 'read';
    } else {
      // For now, assume delivered if not read
      // In a real app, this would check delivery receipts
      status = 'delivered';
    }

    return {
      status,
      readByUserIds,
      readByCount,
      displayMode,
    };
  }, [readReceipts, conversationId, messageId, conversationType, memberCount, senderId]);
}
