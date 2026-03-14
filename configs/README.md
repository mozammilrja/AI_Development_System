# configs/

## Purpose

System-wide configuration files for the AI development platform.

## Contents

- **agents.yaml**: Agent model settings and parameters
- **environment.yaml**: Environment-specific configurations
- **model_config.yaml**: AI model configurations and defaults
- **workflows.yaml**: Workflow definitions and routing rules
- **security.yaml**: Security policies and access controls

## Structure

```
configs/
├── agents.yaml       # Agent settings
├── environment.yaml  # Environment configs
├── model_config.yaml # Model parameters
├── workflows.yaml    # Workflow definitions
└── security.yaml     # Security policies
```

## Usage

Configuration files are loaded at system startup and can be overridden by environment variables.
