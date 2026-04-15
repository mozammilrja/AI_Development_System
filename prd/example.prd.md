# Example Todo App

## Overview

A simple task management application that allows users to create, manage, and track their daily tasks.

## Features

### Feature 1: User Authentication
**Priority**: High

**Description**:
Users can register, login, and logout. Session management with JWT tokens.

**User Stories**:
- As a user, I want to register with email/password so that I can create an account
- As a user, I want to login so that I can access my tasks
- As a user, I want to logout so that I can secure my session

**Acceptance Criteria**:
- [ ] User can register with valid email and password
- [ ] Password is hashed before storage
- [ ] JWT token issued on successful login
- [ ] Token expires after 24 hours

**Technical Requirements**:
- bcrypt for password hashing
- jsonwebtoken for JWT
- Rate limiting on auth endpoints

### Feature 2: Task Management
**Priority**: High

**Description**:
CRUD operations for tasks. Users can create, read, update, and delete their tasks.

**User Stories**:
- As a user, I want to create a task so that I can track my work
- As a user, I want to view my tasks so that I know what to do
- As a user, I want to update a task so that I can modify details
- As a user, I want to delete a task so that I can remove completed items

**Acceptance Criteria**:
- [ ] User can create task with title, description, due date
- [ ] User can list all their tasks
- [ ] User can update task status (todo/in-progress/done)
- [ ] User can delete task
- [ ] Tasks are private to each user

**Technical Requirements**:
- Input validation
- Pagination for list endpoint
- Soft delete support

### Feature 3: Task Dashboard
**Priority**: Medium

**Description**:
Visual dashboard showing task statistics and status overview.

**User Stories**:
- As a user, I want to see my task statistics so that I can track progress
- As a user, I want to filter tasks by status so that I can focus on specific items

**Acceptance Criteria**:
- [ ] Dashboard shows total tasks, completed, pending
- [ ] Filter by status (todo/in-progress/done)
- [ ] Sort by due date, created date
- [ ] Responsive design

## Technical Specifications

### Architecture
- Backend: Node.js with Express
- Frontend: React with TypeScript
- Database: PostgreSQL
- Cache: Redis for sessions

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/logout | Logout user |
| GET | /api/tasks | List user tasks |
| POST | /api/tasks | Create task |
| GET | /api/tasks/:id | Get task by ID |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/dashboard/stats | Get dashboard stats |

### Database Schema

**users**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

**tasks**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| status | ENUM | DEFAULT 'todo' |
| due_date | TIMESTAMP | |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |
| deleted_at | TIMESTAMP | |

## Non-Functional Requirements

### Performance
- API response time < 200ms (p95)
- Page load time < 2s
- Support 100 concurrent users

### Security
- HTTPS only
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting (100 req/min)

### Scalability
- Stateless API design
- Horizontal scaling ready
- Database connection pooling

## Timeline

- Week 1: Authentication + Database
- Week 2: Task API + Tests
- Week 3: Frontend + Dashboard
- Week 4: Security + Performance + Review
