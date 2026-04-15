# Product Requirement Documents

Place your PRD files in this directory to trigger autonomous development.

## PRD Format

PRD files must follow this naming convention:
- `<product-name>.prd.md`

## PRD Template

```markdown
# Product Name

## Overview
Brief description of the product.

## Features

### Feature 1: Feature Name
**Priority**: High | Medium | Low

**Description**:
Detailed description of the feature.

**User Stories**:
- As a [user], I want to [action] so that [benefit]

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2

**Technical Requirements**:
- Requirement 1
- Requirement 2

### Feature 2: Feature Name
...

## Technical Specifications

### Architecture
- Backend: Node.js/Express
- Frontend: React
- Database: PostgreSQL

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/resource | List resources |
| POST | /api/resource | Create resource |

### Database Schema
- Table definitions
- Relationships

## Non-Functional Requirements

### Performance
- API response time < 200ms
- Page load < 2s

### Security
- Authentication required
- Data encryption

### Scalability
- Support 1000 concurrent users

## Timeline
- Phase 1: Core features (Week 1-2)
- Phase 2: Additional features (Week 3-4)
```

## How It Works

1. Create a PRD file following the template
2. Place it in this directory (`prd/`)
3. Run `/build-prd` command
4. Team Lead agent parses the PRD
5. Tasks are generated and distributed
6. Worker agents build the product
7. Final review and build report generated

## Example

See `example.prd.md` for a complete example.
