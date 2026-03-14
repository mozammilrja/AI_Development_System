# scripts/

## Purpose

Automation scripts and utilities for the AI development system.

## Contents

- **setup/**: Environment setup scripts
- **build/**: Build automation
- **deploy/**: Deployment scripts
- **maintenance/**: Maintenance utilities

## Structure

```
scripts/
├── setup/
│   ├── install.sh      # Initial setup
│   └── configure.sh    # Configuration
├── build/
│   ├── build-all.sh    # Build all services
│   └── build-docker.sh # Docker builds
├── deploy/
│   ├── deploy-staging.sh
│   └── deploy-production.sh
└── maintenance/
    ├── cleanup.sh      # Cleanup utilities
    └── backup.sh       # Backup scripts
```

## Usage

Scripts should be run from the repository root:

```bash
# Make executable
chmod +x scripts/setup/install.sh

# Run setup
./scripts/setup/install.sh
```

## Guidelines

- Use bash for portability
- Include error handling
- Document parameters
- Support dry-run mode where appropriate
