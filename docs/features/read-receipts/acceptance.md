# Acceptance Criteria: Read Receipts

**Feature:** Chat Read Receipts  
**Owner:** Product Manager Agent  

---

## Functional Criteria

### Message Status Display

- [ ] **Sent**: Single gray checkmark appears immediately after sending
- [ ] **Delivered**: Double gray checkmarks appear when delivered to recipient(s)
- [ ] **Read**: Double blue/filled checkmarks appear when read by recipient
- [ ] Status icons are consistent across all message types (text, media, files)
- [ ] Status is visible on every message in the conversation view

### Real-Time Updates

- [ ] Status changes push to sender within 500ms of event
- [ ] No page refresh required for status updates
- [ ] Updates work while app is in foreground
- [ ] Queued updates delivered when app returns to foreground

### Privacy Controls

- [ ] Read receipts toggle is accessible in Settings > Privacy
- [ ] Toggle state persists across sessions
- [ ] Disabling read receipts is bidirectional (can't see others' either)
- [ ] Privacy setting takes effect immediately

### Group Chats

- [ ] "Delivered" means delivered to at least one participant
- [ ] "Read by X" shows aggregate count on message
- [ ] Tapping count reveals detailed read list
- [ ] Read list shows avatar, name, and timestamp

### Edge Cases

- [ ] Handles messages sent while recipient is offline
- [ ] Handles read receipts when sender is offline
- [ ] Gracefully handles network interruptions
- [ ] Works for conversations with deleted users

---

## Non-Functional Criteria

### Performance

- [ ] Read receipt API responds in < 100ms (p95)
- [ ] WebSocket delivery in < 500ms (p95)
- [ ] No visible UI lag when updating status
- [ ] Minimal battery impact on mobile devices

### Accessibility

- [ ] Status has text alternative (not just icons)
- [ ] Screen readers announce "Delivered" / "Read"
- [ ] Color is not the only indicator (shape differs)
- [ ] Works with high contrast mode

### Scalability

- [ ] Handles 10,000 read receipts per second
- [ ] Read receipts table uses TTL for old data
- [ ] Efficient indexing for quick lookups

---

## Edge Cases

### Offline Scenarios

- [ ] Recipient offline → receipt queued → delivered when online
- [ ] Sender offline → receipt cached → displayed when online
- [ ] Both offline → syncs correctly when both online

### Multi-Device

- [ ] Reading on device A marks read on device B
- [ ] Receipt generated only once per user (not per device)
- [ ] All sender's devices see updated status

### Privacy Edge Cases

- [ ] User A has receipts ON, User B has receipts OFF → no receipts shown to either
- [ ] User enables receipts → only applies to new messages
- [ ] User disables receipts → immediate effect, no retroactive changes

---

## Test Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| Send message, recipient online | Shows read within 500ms of view |
| Send message, recipient offline | Shows delivered when recipient comes online |
| Send to group of 5 | Shows "Read by X" with accurate count |
| Disable receipts, send message | Sender sees delivered, never read |
| Read on phone, check desktop | Desktop shows message as read |
