# Read Receipts Performance Benchmark

**Owner:** Performance Engineer Agent

```typescript
import Benchmark from 'benchmark';
import { ReadReceiptService } from '../../app/backend/readReceiptService';
import { connectDatabase, disconnectDatabase } from '../../app/backend/src/config/database';

const suite = new Benchmark.Suite('Read Receipts');

// Setup
const service = new ReadReceiptService();
const testMessageId = '507f1f77bcf86cd799439011';
const testUserId = '507f1f77bcf86cd799439012';
const testConversationId = '507f1f77bcf86cd799439014';

suite
  .add('markAsRead - single message', {
    defer: true,
    fn: async (deferred: any) => {
      await service.markAsRead({
        messageId: testMessageId,
        userId: testUserId,
      });
      deferred.resolve();
    },
  })
  .add('markConversationAsRead - 50 messages', {
    defer: true,
    fn: async (deferred: any) => {
      await service.markConversationAsRead({
        conversationId: testConversationId,
        userId: testUserId,
      });
      deferred.resolve();
    },
  })
  .add('getReceiptsForMessage - with 10 receipts', {
    defer: true,
    fn: async (deferred: any) => {
      await service.getReceiptsForMessage(testMessageId, testUserId, 20, 0);
      deferred.resolve();
    },
  })
  .add('getUnreadCount', {
    defer: true,
    fn: async (deferred: any) => {
      await service.getUnreadCount(testConversationId, testUserId);
      deferred.resolve();
    },
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target));
  })
  .on('complete', function (this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  });

// Run
async function runBenchmarks() {
  await connectDatabase();
  suite.run({ async: true });
  await disconnectDatabase();
}

runBenchmarks().catch(console.error);
```

## Expected Results

| Operation | Target Ops/sec | Min Acceptable |
|-----------|----------------|----------------|
| markAsRead (single) | 1000+ | 500 |
| markConversationAsRead (50 msgs) | 100+ | 50 |
| getReceiptsForMessage | 2000+ | 1000 |
| getUnreadCount | 5000+ | 2000 |
