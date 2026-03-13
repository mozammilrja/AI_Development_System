# Terraform configuration for ai-dev-system infrastructure
# Customize provider and resources to match your cloud target.

terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region
}

# ---------- Variables ----------

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project identifier used for naming"
  type        = string
  default     = "ai-dev-system"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# ---------- Networking ----------

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "${var.project_name}-vpc"
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public"
  }
}

resource "aws_subnet" "private" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.2.0/24"

  tags = {
    Name = "${var.project_name}-private"
  }
}

# ---------- Database (RDS) ----------

resource "aws_db_instance" "postgres" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "16"
  instance_class = "db.t3.micro"

  allocated_storage = 20
  storage_encrypted = true

  db_name  = "ai_dev_db"
  username = "postgres"
  password = "CHANGE_ME_BEFORE_APPLY" # Use secrets manager in production

  db_subnet_group_name = aws_db_subnet_group.main.name
  skip_final_snapshot  = true

  tags = {
    Environment = var.environment
  }
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnets"
  subnet_ids = [aws_subnet.private.id, aws_subnet.public.id]
}

# ---------- Outputs ----------

output "vpc_id" {
  value = aws_vpc.main.id
}

output "db_endpoint" {
  value = aws_db_instance.postgres.endpoint
}
