# Security Best Practices

Security guidelines for building secure applications in the AI Development System.

---

## OWASP Top 10 Mitigations

### A01: Broken Access Control

```typescript
// ✗ BAD: No authorization check
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

// ✓ GOOD: Proper authorization
app.get('/api/users/:id', authenticate, async (req, res) => {
  // Check user can access this resource
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    throw new ForbiddenError('Access denied');
  }
  const user = await User.findById(req.params.id);
  res.json(user);
});
```

### A02: Cryptographic Failures

```typescript
// ✗ BAD: Weak hashing
const hash = md5(password);

// ✓ GOOD: Strong hashing with salt
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);
const isValid = await bcrypt.compare(password, hash);
```

### A03: Injection

```typescript
// ✗ BAD: SQL injection vulnerable
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✓ GOOD: Parameterized query
const user = await User.findOne({ _id: userId });

// ✓ GOOD: Parameterized SQL
const [users] = await db.query(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);
```

### A04: Insecure Design

```typescript
// ✗ BAD: No rate limiting on sensitive endpoint
app.post('/api/auth/login', loginHandler);

// ✓ GOOD: Rate limiting applied
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, try again later'
});

app.post('/api/auth/login', authLimiter, loginHandler);
```

### A05: Security Misconfiguration

```typescript
// ✓ GOOD: Security headers
import helmet from 'helmet';

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  }
}));

// ✓ GOOD: CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));
```

### A06: Vulnerable Components

```bash
# Regular dependency audits
npm audit
npm audit fix

# Use lockfiles
npm ci  # Not npm install in CI

# Check for outdated packages
npm outdated
```

### A07: Authentication Failures

```typescript
// ✓ GOOD: JWT configuration
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  {
    expiresIn: '15m',  // Short-lived access token
    algorithm: 'HS256'
  }
);

// ✓ GOOD: Refresh token rotation
const refreshToken = generateSecureToken();
await storeRefreshToken(user.id, refreshToken, {
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000  // 7 days
});

// ✓ GOOD: Password requirements
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase')
  .regex(/[a-z]/, 'Password must contain lowercase')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');
```

### A08: Data Integrity Failures

```typescript
// ✓ GOOD: Verify data integrity
import crypto from 'crypto';

function signData(data: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

function verifySignature(data: string, signature: string, secret: string): boolean {
  const expected = signData(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

### A09: Logging Failures

```typescript
// ✓ GOOD: Security event logging
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Log security events
securityLogger.info('Login attempt', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  success: true,
  timestamp: new Date().toISOString()
});

// ✗ NEVER log sensitive data
securityLogger.info('Login', { password }); // NEVER!
```

### A10: SSRF (Server-Side Request Forgery)

```typescript
// ✗ BAD: Unrestricted URL fetching
app.get('/fetch', async (req, res) => {
  const data = await fetch(req.query.url);
  res.json(data);
});

// ✓ GOOD: URL validation
const ALLOWED_HOSTS = ['api.trusted.com', 'cdn.trusted.com'];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_HOSTS.includes(parsed.host);
  } catch {
    return false;
  }
}

app.get('/fetch', async (req, res) => {
  if (!isAllowedUrl(req.query.url)) {
    throw new BadRequestError('URL not allowed');
  }
  const data = await fetch(req.query.url);
  res.json(data);
});
```

---

## Input Validation

### Request Validation

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().min(2).max(100).trim(),
  age: z.number().int().min(13).max(120).optional(),
  role: z.enum(['user', 'admin']).default('user')
});

// Middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Validation failed', error.errors);
      }
      throw error;
    }
  };
};

app.post('/api/users', validate(createUserSchema), createUser);
```

### Output Encoding

```typescript
// ✓ GOOD: Escape HTML output
import { escape } from 'html-escaper';

const safeHtml = escape(userInput);

// React automatically escapes
const Component = () => (
  <div>{userInput}</div>  // Safe
);

// ✗ DANGEROUS: Only when absolutely necessary
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

---

## Authentication

### Password Storage

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### JWT Best Practices

```typescript
// Token generation
function generateTokens(user: User) {
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');
  
  return { accessToken, refreshToken };
}

// Token verification
function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    throw new UnauthorizedError('Invalid token');
  }
}
```

---

## Secrets Management

### Environment Variables

```bash
# .env.example (commit this)
DATABASE_URL=
JWT_SECRET=
API_KEY=

# .env (NEVER commit)
DATABASE_URL=mongodb://localhost:27017/myapp
JWT_SECRET=super-secret-key-at-least-32-chars
API_KEY=sk_live_abc123
```

### Secrets in Code

```typescript
// ✗ NEVER: Hardcoded secrets
const apiKey = 'sk_live_abc123';

// ✓ GOOD: Environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY environment variable required');
}

// ✓ GOOD: Secrets validation at startup
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

---

## HTTPS & Transport Security

```typescript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// HSTS header (via helmet)
app.use(helmet.hsts({
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true
}));
```

---

## Session Security

```typescript
import session from 'express-session';

app.use(session({
  secret: process.env.SESSION_SECRET!,
  name: 'sessionId', // Don't use default 'connect.sid'
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,    // Not accessible via JavaScript
    secure: true,      // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 3600000    // 1 hour
  }
}));
```

---

## File Upload Security

```typescript
import multer from 'multer';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      // Generate safe filename
      const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uniqueName}${ext}`);
    }
  }),
  limits: {
    fileSize: MAX_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
      return;
    }
    cb(null, true);
  }
});
```

---

## Security Headers

```typescript
// Complete security headers setup
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
}));
```

---

## Security Checklist

### Authentication
- [ ] Strong password requirements
- [ ] Secure password hashing (bcrypt)
- [ ] Short-lived access tokens
- [ ] Refresh token rotation
- [ ] Account lockout after failed attempts
- [ ] Secure password reset flow

### Authorization
- [ ] Principle of least privilege
- [ ] Role-based access control
- [ ] Resource ownership verification
- [ ] API endpoint protection

### Data Protection
- [ ] Encryption at rest
- [ ] Encryption in transit (HTTPS)
- [ ] Sensitive data not logged
- [ ] PII handling compliance

### Application Security
- [ ] Input validation on all endpoints
- [ ] Output encoding
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Security headers configured
- [ ] Dependencies audited

### Infrastructure
- [ ] Secrets in environment variables
- [ ] No hardcoded credentials
- [ ] Secure configuration
- [ ] Monitoring and alerting
