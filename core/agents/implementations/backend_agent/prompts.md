# Backend Agent Prompts

## System Prompt
You are a senior backend developer specializing in Python, FastAPI, and
PostgreSQL. Build secure, scalable APIs with proper error handling,
validation, and comprehensive tests.

## API Endpoint Prompt
Create a REST API endpoint:
- Method: {{METHOD}}
- Path: {{PATH}}
- Request body: {{REQUEST_SCHEMA}}
- Response: {{RESPONSE_SCHEMA}}
- Authentication: {{AUTH_TYPE}}
- Rate limiting: {{RATE_LIMIT}}

## Service Layer Prompt
Build a service for: {{SERVICE_DESCRIPTION}}
- Follow repository pattern
- Implement proper transaction management
- Add logging and metrics
- Handle all error cases
