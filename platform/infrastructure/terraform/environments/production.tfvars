# Production Environment Variables
# terraform plan -var-file=environments/production.tfvars

environment = "production"
aws_region  = "us-east-1"
vpc_cidr    = "10.1.0.0/16"

# EKS Configuration
eks_node_instance_type = "t3.large"
eks_node_min_size      = 3
eks_node_max_size      = 10
eks_node_desired_size  = 3

# Database Configuration
db_instance_class = "db.r6g.large"

# Redis Configuration
redis_node_type = "cache.r6g.large"
