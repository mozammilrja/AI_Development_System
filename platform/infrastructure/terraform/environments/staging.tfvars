# Staging Environment Variables
# terraform plan -var-file=environments/staging.tfvars

environment = "staging"
aws_region  = "us-east-1"
vpc_cidr    = "10.0.0.0/16"

# EKS Configuration
eks_node_instance_type = "t3.medium"
eks_node_min_size      = 1
eks_node_max_size      = 5
eks_node_desired_size  = 2

# Database Configuration
db_instance_class = "db.t3.medium"

# Redis Configuration
redis_node_type = "cache.t3.micro"
