# Terraform Main Configuration
# AWS Infrastructure for AI Development System

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }

  backend "s3" {
    bucket         = "ai-dev-system-terraform-state"
    key            = "state/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

# ============================================
# Provider Configuration
# ============================================
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ai-dev-system"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ============================================
# Variables
# ============================================
variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "staging"

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be staging or production"
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

# ============================================
# VPC
# ============================================
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "ai-dev-system-${var.environment}"
  cidr = var.vpc_cidr

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment == "staging"
  enable_dns_hostnames   = true
  enable_dns_support     = true

  tags = {
    "kubernetes.io/cluster/ai-dev-${var.environment}" = "shared"
  }

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# ============================================
# EKS Cluster
# ============================================
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "ai-dev-${var.environment}"
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    default = {
      name           = "default-node-group"
      instance_types = var.environment == "production" ? ["t3.large"] : ["t3.medium"]
      
      min_size     = var.environment == "production" ? 3 : 1
      max_size     = var.environment == "production" ? 10 : 5
      desired_size = var.environment == "production" ? 3 : 2
    }
  }
}

# ============================================
# RDS (MongoDB Atlas or DocumentDB)
# ============================================
resource "aws_docdb_cluster" "main" {
  count = var.environment == "production" ? 1 : 0

  cluster_identifier      = "ai-dev-${var.environment}"
  engine                  = "docdb"
  master_username         = "admin"
  master_password         = var.db_password
  db_subnet_group_name    = aws_docdb_subnet_group.main[0].name
  vpc_security_group_ids  = [aws_security_group.docdb[0].id]
  skip_final_snapshot     = var.environment != "production"
  
  tags = {
    Name = "ai-dev-${var.environment}-docdb"
  }
}

resource "aws_docdb_subnet_group" "main" {
  count = var.environment == "production" ? 1 : 0

  name       = "ai-dev-${var.environment}"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name = "ai-dev-${var.environment}-docdb-subnet"
  }
}

resource "aws_security_group" "docdb" {
  count = var.environment == "production" ? 1 : 0

  name_prefix = "ai-dev-docdb-${var.environment}"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }

  tags = {
    Name = "ai-dev-${var.environment}-docdb-sg"
  }
}

# ============================================
# ElastiCache (Redis)
# ============================================
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "ai-dev-${var.environment}"
  engine               = "redis"
  node_type            = var.environment == "production" ? "cache.r6g.large" : "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]

  tags = {
    Name = "ai-dev-${var.environment}-redis"
  }
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "ai-dev-${var.environment}-redis"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "redis" {
  name_prefix = "ai-dev-redis-${var.environment}"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }

  tags = {
    Name = "ai-dev-${var.environment}-redis-sg"
  }
}

# ============================================
# Outputs
# ============================================
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}
