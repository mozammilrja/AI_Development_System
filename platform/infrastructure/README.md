# platform/infrastructure/

## Purpose

Infrastructure as Code (IaC) configurations for cloud resources.

## Ownership

**DevOps Engineer Agent** has exclusive write access to this directory.

## Contents

| Directory | Purpose |
|-----------|---------|
| `terraform/` | Terraform configurations |
| `kubernetes/` | Kubernetes manifests |
| `monitoring/` | Monitoring stack configs |

## Infrastructure Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUD PROVIDER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   VPC    │  │   EKS    │  │   RDS    │  │   S3     │        │
│  │  Network │  │  Cluster │  │ Database │  │ Storage  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ ElastiC  │  │  Secret  │  │   ALB    │  │CloudWatch│        │
│  │ Cache    │  │ Manager  │  │  Ingress │  │ Logging  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```bash
# Initialize Terraform
cd terraform && terraform init

# Plan changes
terraform plan -var-file=environments/staging.tfvars

# Apply changes
terraform apply -var-file=environments/staging.tfvars

# Destroy (be careful!)
terraform destroy -var-file=environments/staging.tfvars
```

## State Management

Terraform state is stored remotely in S3 with DynamoDB locking:

```hcl
terraform {
  backend "s3" {
    bucket         = "ai-dev-system-terraform-state"
    key            = "state/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```
