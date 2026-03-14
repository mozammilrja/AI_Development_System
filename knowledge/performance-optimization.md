# Performance Optimization

Guidelines for building and maintaining high-performance applications.

---

## Performance Metrics

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤2.5s | ≤4.0s | >4.0s |
| **FID** (First Input Delay) | ≤100ms | ≤300ms | >300ms |
| **CLS** (Cumulative Layout Shift) | ≤0.1 | ≤0.25 | >0.25 |

### Backend Metrics

| Metric | Target |
|--------|--------|
| p50 latency | <100ms |
| p95 latency | <300ms |
| p99 latency | <500ms |
| Throughput | >1000 rps |
| Error rate | <0.1% |

---

## Backend Optimization

### Database Optimization

#### Indexing

```typescript
// ✓ Add indexes for frequently queried fields
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ status: 1, createdAt: -1 }); // Compound index

// Analyze query performance
db.users.find({ email: 'test@example.com' }).explain('executionStats');
```

#### Query Optimization

```typescript
// ✗ BAD: N+1 query problem
const users = await User.find();
for (const user of users) {
  user.orders = await Order.find({ userId: user.id });
}

// ✓ GOOD: Single query with populate
const users = await User.find().populate('orders');

// ✓ GOOD: Aggregation for complex queries
const result = await User.aggregate([
  { $match: { status: 'active' } },
  { $lookup: {
      from: 'orders',
      localField: '_id',
      foreignField: 'userId',
      as: 'orders'
  }},
  { $project: { name: 1, orderCount: { $size: '$orders' } } }
]);
```

#### Pagination

```typescript
// ✗ BAD: Skip-based pagination (slow for large offsets)
const users = await User.find().skip(10000).limit(20);

// ✓ GOOD: Cursor-based pagination
const users = await User.find({ _id: { $gt: lastId } })
  .sort({ _id: 1 })
  .limit(20);
```

### Caching

#### In-Memory Caching

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ 
  stdTTL: 300,      // 5 minutes default
  checkperiod: 60   // Check for expired keys every 60s
});

async function getUser(id: string): Promise<User> {
  const cached = cache.get<User>(`user:${id}`);
  if (cached) return cached;

  const user = await User.findById(id);
  cache.set(`user:${id}`, user);
  return user;
}
```

#### Redis Caching

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

// Usage
const user = await getCachedData(
  `user:${id}`,
  () => User.findById(id),
  600 // 10 minutes
);
```

#### Cache Invalidation

```typescript
// Invalidate on update
async function updateUser(id: string, data: UpdateUserDTO) {
  const user = await User.findByIdAndUpdate(id, data, { new: true });
  await redis.del(`user:${id}`);
  return user;
}

// Pattern-based invalidation
async function clearUserCaches(userId: string) {
  const keys = await redis.keys(`user:${userId}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

### Connection Pooling

```typescript
// MongoDB connection pooling
mongoose.connect(process.env.DATABASE_URL, {
  maxPoolSize: 50,
  minPoolSize: 10,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
});

// PostgreSQL connection pooling
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Async Processing

```typescript
// ✗ BAD: Blocking operation in request
app.post('/api/orders', async (req, res) => {
  const order = await Order.create(req.body);
  await sendConfirmationEmail(order); // Slow!
  await updateInventory(order);       // Slow!
  res.json(order);
});

// ✓ GOOD: Queue background tasks
import Bull from 'bull';

const emailQueue = new Bull('email', process.env.REDIS_URL);

app.post('/api/orders', async (req, res) => {
  const order = await Order.create(req.body);
  
  // Queue background tasks
  await emailQueue.add('orderConfirmation', { orderId: order.id });
  
  res.json(order);
});

// Process in background
emailQueue.process('orderConfirmation', async (job) => {
  const order = await Order.findById(job.data.orderId);
  await sendConfirmationEmail(order);
});
```

### Compression

```typescript
import compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Balance between speed and compression
  threshold: 1024 // Only compress responses > 1KB
}));
```

---

## Frontend Optimization

### Bundle Optimization

#### Code Splitting

```typescript
// Route-based code splitting
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

#### Tree Shaking

```typescript
// ✗ BAD: Import entire library
import _ from 'lodash';
_.debounce(fn, 300);

// ✓ GOOD: Import only what you need
import debounce from 'lodash/debounce';
debounce(fn, 300);

// ✓ GOOD: Use ES modules for tree shaking
import { debounce } from 'lodash-es';
```

#### Dynamic Imports

```typescript
// Load heavy libraries on demand
const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};

// Load components on interaction
const handleClick = async () => {
  const { HeavyModal } = await import('./HeavyModal');
  setModalComponent(HeavyModal);
};
```

### Image Optimization

```tsx
// Next.js Image component
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority           // Preload above-fold images
  placeholder="blur" // Show blur while loading
/>

// Lazy loading images
<img 
  src="image.jpg" 
  loading="lazy" 
  decoding="async"
/>

// Responsive images
<img
  srcSet="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 1000px) 800px, 1200px"
  src="large.jpg"
/>
```

### React Performance

#### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize components
const ExpensiveList = memo(({ items, onSelect }) => (
  <ul>
    {items.map(item => (
      <li key={item.id} onClick={() => onSelect(item)}>
        {item.name}
      </li>
    ))}
  </ul>
));

// Memoize values
const filteredItems = useMemo(
  () => items.filter(item => item.status === 'active'),
  [items]
);

// Memoize callbacks
const handleSelect = useCallback((item) => {
  setSelected(item);
}, []);
```

#### Virtualization

```typescript
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

#### Debouncing

```typescript
import { useDebouncedCallback } from 'use-debounce';

function SearchInput() {
  const [query, setQuery] = useState('');
  
  const debouncedSearch = useDebouncedCallback(
    (value) => {
      // API call
      searchAPI(value);
    },
    300 // 300ms debounce
  );

  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value);
      }}
    />
  );
}
```

### Resource Hints

```html
<!-- Preconnect to required origins -->
<link rel="preconnect" href="https://api.example.com">
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- Prefetch likely next pages -->
<link rel="prefetch" href="/dashboard">

<!-- Preload critical resources -->
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
<link rel="preload" href="/hero.jpg" as="image">
```

---

## API Optimization

### Request Batching

```typescript
// ✗ BAD: Multiple requests
const user = await api.getUser(userId);
const orders = await api.getOrders(userId);
const notifications = await api.getNotifications(userId);

// ✓ GOOD: Batch request
const data = await api.batch({
  user: { endpoint: `/users/${userId}` },
  orders: { endpoint: `/users/${userId}/orders` },
  notifications: { endpoint: `/notifications` }
});
```

### Response Compression

```typescript
// Accept compressed responses
fetch('/api/data', {
  headers: {
    'Accept-Encoding': 'gzip, deflate, br'
  }
});
```

### Conditional Requests

```typescript
// ETag-based caching
const response = await fetch('/api/resource', {
  headers: {
    'If-None-Match': cachedETag
  }
});

if (response.status === 304) {
  // Use cached data
  return cachedData;
}
```

---

## Monitoring

### Performance Metrics Collection

```typescript
// Web Vitals
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getLCP(console.log);

// Send to analytics
function sendToAnalytics(metric) {
  analytics.track('web-vital', {
    name: metric.name,
    value: metric.value,
    id: metric.id
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
```

### Backend Metrics

```typescript
import { collectDefaultMetrics, Counter, Histogram } from 'prom-client';

// Collect default Node.js metrics
collectDefaultMetrics();

// Custom metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

// Middleware
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path, status_code: res.statusCode });
  });
  next();
});
```

---

## Performance Checklist

### Backend
- [ ] Database queries optimized
- [ ] Proper indexes in place
- [ ] Connection pooling configured
- [ ] Caching implemented
- [ ] Async processing for slow tasks
- [ ] Response compression enabled
- [ ] Rate limiting configured

### Frontend
- [ ] Bundle size minimized
- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Lazy loading enabled
- [ ] React memoization applied
- [ ] Virtualization for long lists
- [ ] Resource hints configured

### Monitoring
- [ ] Performance metrics collected
- [ ] Alerts configured
- [ ] Regular performance audits
- [ ] Lighthouse CI in pipeline
