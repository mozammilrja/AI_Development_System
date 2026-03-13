# ChatHub - Infrastructure Guide

**Version:** 1.0  
**Date:** March 13, 2026  
**Environments:** Local (Docker) → Cloud (Kubernetes)  

---

## 1. Overview

### 1.1 Environment Strategy

| Environment | Infrastructure | Purpose |
|-------------|---------------|---------|
| **Local** | Docker Compose | Development & testing |
| **Staging** | Kubernetes (Cloud) | Pre-production validation |
| **Production** | Kubernetes (Cloud) | Live system |

### 1.2 Infrastructure Components

| Service | Local | Cloud |
|---------|-------|-------|
| API + WebSocket | Docker container | Kubernetes pods |
| MongoDB | Docker container | Managed (Atlas) |
| Redis | Docker container | Managed (ElastiCache) |
| File Storage | MinIO container | S3 / Cloud Storage |
| Search | Elasticsearch container | Managed / Self-hosted |
| Video SFU | mediasoup container | Dedicated instances |
| Load Balancer | NGINX | Cloud LB (ALB/NLB) |
| CDN | - | CloudFront / Cloud CDN |

---

## 2. Local Development Setup

### 2.1 Prerequisites

- Docker Desktop 4.x+
- Docker Compose 2.x+
- Node.js 20.x LTS
- Git

### 2.2 Docker Compose Configuration

```yaml
# platform/docker/docker-compose.dev.yml
version: '3.8'

services:
  # ─────────────────────────────────────────────
  # Application Services
  # ─────────────────────────────────────────────
  
  backend:
    build:
      context: ../../../app/backend
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    volumes:
      - ../../../app/backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - PORT=3001
      - MONGODB_URI=mongodb://mongodb:27017/chathub
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - MINIO_BUCKET=chathub
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - JWT_SECRET=dev-secret-change-in-production
      - JWT_EXPIRES_IN=15m
      - REFRESH_TOKEN_EXPIRES_IN=7d
    depends_on:
      - mongodb
      - redis
      - minio
      - elasticsearch
    networks:
      - chathub-network
    command: npm run dev
    
  frontend:
    build:
      context: ../../../app/frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ../../../app/frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:3001
      - VITE_WS_URL=ws://localhost:3001
    depends_on:
      - backend
    networks:
      - chathub-network
    command: npm run dev
    
  mediasoup:
    build:
      context: ./mediasoup
      dockerfile: Dockerfile
    ports:
      - "40000-40100:40000-40100/udp"  # RTP ports
      - "3002:3002"  # Signaling
    environment:
      - MEDIASOUP_LISTEN_IP=0.0.0.0
      - MEDIASOUP_ANNOUNCED_IP=127.0.0.1
      - MEDIASOUP_MIN_PORT=40000
      - MEDIASOUP_MAX_PORT=40100
    networks:
      - chathub-network
      
  # ─────────────────────────────────────────────
  # Data Services
  # ─────────────────────────────────────────────
  
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./mongodb/init.js:/docker-entrypoint-initdb.d/init.js:ro
    environment:
      - MONGO_INITDB_DATABASE=chathub
    networks:
      - chathub-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh --quiet
      interval: 10s
      timeout: 5s
      retries: 5
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    command: redis-server /usr/local/etc/redis/redis.conf
    networks:
      - chathub-network
    healthcheck:
      test: redis-cli ping
      interval: 10s
      timeout: 5s
      retries: 5
      
  minio:
    image: minio/minio
    ports:
      - "9000:9000"   # API
      - "9001:9001"   # Console
    volumes:
      - minio_data:/data
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    networks:
      - chathub-network
    healthcheck:
      test: curl -f http://localhost:9000/minio/health/live
      interval: 10s
      timeout: 5s
      retries: 5
      
  # Create default bucket
  minio-setup:
    image: minio/mc
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
      mc alias set minio http://minio:9000 minioadmin minioadmin;
      mc mb minio/chathub --ignore-existing;
      mc anonymous set download minio/chathub/public;
      exit 0;
      "
    networks:
      - chathub-network
      
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    networks:
      - chathub-network
    healthcheck:
      test: curl -f http://localhost:9200/_cluster/health
      interval: 10s
      timeout: 5s
      retries: 10

  # ─────────────────────────────────────────────
  # Observability (Optional for dev)
  # ─────────────────────────────────────────────
  
  # Uncomment for local monitoring
  # prometheus:
  #   image: prom/prometheus
  #   ports:
  #     - "9090:9090"
  #   volumes:
  #     - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
  #   networks:
  #     - chathub-network
      
  # grafana:
  #   image: grafana/grafana
  #   ports:
  #     - "3000:3000"
  #   volumes:
  #     - grafana_data:/var/lib/grafana
  #   networks:
  #     - chathub-network

networks:
  chathub-network:
    driver: bridge

volumes:
  mongodb_data:
  redis_data:
  minio_data:
  elasticsearch_data:
  # grafana_data:
```

### 2.3 Backend Dockerfile (Development)

```dockerfile
# app/backend/Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose port
EXPOSE 3001

# Use nodemon for hot reload
CMD ["npm", "run", "dev"]
```

### 2.4 Frontend Dockerfile (Development)

```dockerfile
# app/frontend/Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose Vite port
EXPOSE 5173

# Start dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 2.5 Local Development Commands

```bash
# Start all services
docker compose -f platform/docker/docker-compose.dev.yml up

# Start with build
docker compose -f platform/docker/docker-compose.dev.yml up --build

# Start specific services
docker compose -f platform/docker/docker-compose.dev.yml up backend mongodb redis

# View logs
docker compose -f platform/docker/docker-compose.dev.yml logs -f backend

# Stop all
docker compose -f platform/docker/docker-compose.dev.yml down

# Clean volumes (reset data)
docker compose -f platform/docker/docker-compose.dev.yml down -v
```

### 2.6 Environment Files

```bash
# .env.local (for local development)
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/chathub

# Redis
REDIS_URL=redis://localhost:6379

# MinIO (S3-compatible)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=chathub
MINIO_USE_SSL=false

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# JWT
JWT_SECRET=local-development-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# mediasoup
MEDIASOUP_LISTEN_IP=127.0.0.1
MEDIASOUP_MIN_PORT=40000
MEDIASOUP_MAX_PORT=40100

# Frontend
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

---

## 3. Cloud Production Setup

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │         CloudFront CDN        │
                    │  (Static assets + API cache)  │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │    Application Load Balancer  │
                    │     (SSL termination)         │
                    └───────────────┬───────────────┘
                                    │
               ┌────────────────────┼────────────────────┐
               │                    │                    │
     ┌─────────▼─────────┐ ┌───────▼───────┐ ┌─────────▼─────────┐
     │  EKS Cluster      │ │  EKS Cluster  │ │  EKS Cluster      │
     │  (us-east-1a)     │ │  (us-east-1b) │ │  (us-east-1c)     │
     │                   │ │               │ │                   │
     │ ┌───────────────┐ │ │ ┌───────────┐ │ │ ┌───────────────┐ │
     │ │ API Pod (x2)  │ │ │ │API Pod(x2)│ │ │ │ API Pod (x2)  │ │
     │ │ + Socket.IO   │ │ │ │+ Socket.IO│ │ │ │ + Socket.IO   │ │
     │ └───────────────┘ │ │ └───────────┘ │ │ └───────────────┘ │
     │ ┌───────────────┐ │ │               │ │ ┌───────────────┐ │
     │ │mediasoup (x1) │ │ │               │ │ │mediasoup (x1) │ │
     │ └───────────────┘ │ │               │ │ └───────────────┘ │
     └─────────┬─────────┘ └───────┬───────┘ └─────────┬─────────┘
               │                   │                   │
               └───────────────────┼───────────────────┘
                                   │
     ┌─────────────────────────────┼─────────────────────────────┐
     │                             │                             │
┌────▼─────┐               ┌───────▼───────┐             ┌───────▼──────┐
│ MongoDB  │               │  ElastiCache  │             │      S3      │
│  Atlas   │               │    (Redis)    │             │   (Files)    │
│ (M30+)   │               │   (r6g.large) │             │              │
└──────────┘               └───────────────┘             └──────────────┘
```

### 3.2 Terraform Configuration

#### Main Configuration

```hcl
# platform/terraform/aws/main.tf

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
    bucket         = "chathub-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "ChatHub"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  
  name = "${var.project_name}-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway   = true
  single_nat_gateway   = var.environment != "production"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }
  
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"
  
  cluster_name    = "${var.project_name}-${var.environment}"
  cluster_version = "1.28"
  
  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets
  
  # Node groups
  eks_managed_node_groups = {
    general = {
      name           = "general"
      instance_types = ["t3.large"]
      
      min_size     = 2
      max_size     = 10
      desired_size = 3
      
      labels = {
        role = "general"
      }
    }
    
    mediasoup = {
      name           = "mediasoup"
      instance_types = ["c5.xlarge"]  # CPU-optimized for video
      
      min_size     = 1
      max_size     = 4
      desired_size = 2
      
      labels = {
        role = "mediasoup"
      }
      
      taints = [{
        key    = "dedicated"
        value  = "mediasoup"
        effect = "NO_SCHEDULE"
      }]
    }
  }
  
  # Enable OIDC for IAM roles
  enable_irsa = true
}

# ElastiCache (Redis)
module "elasticache" {
  source = "./modules/elasticache"
  
  cluster_id           = "${var.project_name}-redis"
  node_type            = var.environment == "production" ? "cache.r6g.large" : "cache.t3.medium"
  num_cache_nodes      = var.environment == "production" ? 3 : 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = 6379
  
  subnet_group_name = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]
}

# S3 Bucket for files
resource "aws_s3_bucket" "files" {
  bucket = "${var.project_name}-files-${var.environment}"
}

resource "aws_s3_bucket_cors_configuration" "files" {
  bucket = aws_s3_bucket.files.id
  
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = var.cors_origins
    max_age_seconds = 3000
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  # S3 origin for static files
  origin {
    domain_name = aws_s3_bucket.files.bucket_regional_domain_name
    origin_id   = "S3-files"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }
  
  # ALB origin for API
  origin {
    domain_name = module.alb.dns_name
    origin_id   = "ALB-api"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  
  # Default cache behavior (static)
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-files"
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }
  
  # API behavior (no cache)
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "ALB-api"
    viewer_protocol_policy = "https-only"
    
    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Origin", "Accept"]
      cookies {
        forward = "all"
      }
    }
    
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
```

#### Variables

```hcl
# platform/terraform/aws/variables.tf

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "chathub"
}

variable "environment" {
  description = "Environment (staging, production)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "cors_origins" {
  description = "Allowed CORS origins"
  type        = list(string)
  default     = ["https://chathub.com"]
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for CloudFront"
  type        = string
}

variable "mongodb_atlas_connection_string" {
  description = "MongoDB Atlas connection string"
  type        = string
  sensitive   = true
}
```

### 3.3 Kubernetes Manifests

#### Namespace

```yaml
# platform/k8s/base/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: chathub
  labels:
    name: chathub
```

#### API Deployment

```yaml
# platform/k8s/base/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chathub-api
  namespace: chathub
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chathub-api
  template:
    metadata:
      labels:
        app: chathub-api
    spec:
      containers:
        - name: api
          image: ${ECR_REGISTRY}/chathub-api:${IMAGE_TAG}
          ports:
            - containerPort: 3001
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "3001"
            - name: MONGODB_URI
              valueFrom:
                secretKeyRef:
                  name: chathub-secrets
                  key: mongodb-uri
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: chathub-secrets
                  key: redis-url
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: chathub-secrets
                  key: jwt-secret
            - name: AWS_S3_BUCKET
              value: "chathub-files-production"
            - name: ELASTICSEARCH_URL
              valueFrom:
                secretKeyRef:
                  name: chathub-secrets
                  key: elasticsearch-url
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 5
            periodSeconds: 5
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - chathub-api
                topologyKey: topology.kubernetes.io/zone
---
apiVersion: v1
kind: Service
metadata:
  name: chathub-api
  namespace: chathub
spec:
  selector:
    app: chathub-api
  ports:
    - port: 80
      targetPort: 3001
  type: ClusterIP
```

#### Horizontal Pod Autoscaler

```yaml
# platform/k8s/base/api-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: chathub-api-hpa
  namespace: chathub
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: chathub-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

#### mediasoup Deployment

```yaml
# platform/k8s/base/mediasoup-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mediasoup
  namespace: chathub
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mediasoup
  template:
    metadata:
      labels:
        app: mediasoup
    spec:
      nodeSelector:
        role: mediasoup
      tolerations:
        - key: "dedicated"
          operator: "Equal"
          value: "mediasoup"
          effect: "NoSchedule"
      containers:
        - name: mediasoup
          image: ${ECR_REGISTRY}/chathub-mediasoup:${IMAGE_TAG}
          ports:
            - containerPort: 3002
            - containerPort: 40000
              protocol: UDP
            # ... more ports
          env:
            - name: MEDIASOUP_LISTEN_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.podIP
            - name: MEDIASOUP_ANNOUNCED_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.hostIP
          resources:
            requests:
              memory: "1Gi"
              cpu: "1000m"
            limits:
              memory: "2Gi"
              cpu: "4000m"
      hostNetwork: true  # Required for WebRTC
      dnsPolicy: ClusterFirstWithHostNet
```

#### Ingress

```yaml
# platform/k8s/base/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: chathub-ingress
  namespace: chathub
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: ${ACM_CERT_ARN}
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: "443"
    alb.ingress.kubernetes.io/healthcheck-path: /health
    alb.ingress.kubernetes.io/load-balancer-attributes: idle_timeout.timeout_seconds=3600
spec:
  rules:
    - host: api.chathub.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: chathub-api
                port:
                  number: 80
```

---

## 4. CI/CD Pipeline

### 4.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy ChatHub

on:
  push:
    branches: [main, staging]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: ${{ secrets.ECR_REGISTRY }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: |
          cd app/backend && npm ci
          cd ../frontend && npm ci
          
      - name: Run tests
        run: |
          cd app/backend && npm test
          cd ../frontend && npm test
          
      - name: Run lint
        run: |
          cd app/backend && npm run lint
          cd ../frontend && npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image_tag: ${{ steps.meta.outputs.version }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2
        
      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.ECR_REGISTRY }}/chathub-api
          tags: |
            type=sha
            type=ref,event=branch
            
      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: ./app/backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          
      - name: Build and push Frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./app/frontend
          push: true
          tags: ${{ env.ECR_REGISTRY }}/chathub-frontend:${{ steps.meta.outputs.version }}

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/staging' || github.event.inputs.environment == 'staging'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name chathub-staging --region ${{ env.AWS_REGION }}
        
      - name: Deploy to EKS
        run: |
          cd platform/k8s
          kustomize edit set image api=${{ env.ECR_REGISTRY }}/chathub-api:${{ needs.build.outputs.image_tag }}
          kustomize build overlays/staging | kubectl apply -f -
          
      - name: Wait for rollout
        run: kubectl rollout status deployment/chathub-api -n chathub --timeout=300s

  deploy-production:
    needs: [build, deploy-staging]
    if: github.ref == 'refs/heads/main' || github.event.inputs.environment == 'production'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name chathub-production --region ${{ env.AWS_REGION }}
        
      - name: Deploy to EKS
        run: |
          cd platform/k8s
          kustomize edit set image api=${{ env.ECR_REGISTRY }}/chathub-api:${{ needs.build.outputs.image_tag }}
          kustomize build overlays/production | kubectl apply -f -
          
      - name: Wait for rollout
        run: kubectl rollout status deployment/chathub-api -n chathub --timeout=300s
```

---

## 5. Monitoring & Observability

### 5.1 Prometheus Configuration

```yaml
# platform/k8s/monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      
    scrape_configs:
      - job_name: 'chathub-api'
        kubernetes_sd_configs:
          - role: pod
            namespaces:
              names:
                - chathub
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_label_app]
            regex: chathub-api
            action: keep
          - source_labels: [__meta_kubernetes_pod_container_port_number]
            regex: "3001"
            action: keep
```

### 5.2 Grafana Dashboard

Key metrics to monitor:
- WebSocket connections (active, total)
- Message throughput (messages/sec)
- API latency (p50, p95, p99)
- Error rate
- CPU/Memory usage
- MongoDB query latency
- Redis operations/sec

### 5.3 Alerting Rules

```yaml
# platform/k8s/monitoring/alerts.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: chathub-alerts
  namespace: monitoring
spec:
  groups:
    - name: chathub
      rules:
        - alert: HighErrorRate
          expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "High error rate detected"
            description: "Error rate is above 5% for 5 minutes"
            
        - alert: HighLatency
          expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "High API latency"
            description: "95th percentile latency is above 500ms"
            
        - alert: LowWebSocketConnections
          expr: sum(websocket_connections_active) < 10
          for: 10m
          labels:
            severity: warning
          annotations:
            summary: "Low WebSocket connections"
            description: "Fewer than 10 active connections"
```

---

## 6. Security

### 6.1 Secrets Management

```yaml
# Use Kubernetes secrets with external-secrets operator
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: chathub-secrets
  namespace: chathub
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: chathub-secrets
  data:
    - secretKey: mongodb-uri
      remoteRef:
        key: chathub/production/mongodb
        property: connection_string
    - secretKey: jwt-secret
      remoteRef:
        key: chathub/production/jwt
        property: secret
```

### 6.2 Network Policies

```yaml
# platform/k8s/base/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: chathub-api-policy
  namespace: chathub
spec:
  podSelector:
    matchLabels:
      app: chathub-api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3001
  egress:
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 27017  # MongoDB
        - protocol: TCP
          port: 6379   # Redis
        - protocol: TCP
          port: 9200   # Elasticsearch
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
      ports:
        - protocol: TCP
          port: 443    # HTTPS
```

---

## 7. Disaster Recovery

### 7.1 Backup Strategy

| Data | Method | Frequency | Retention |
|------|--------|-----------|-----------|
| MongoDB | Atlas continuous backup | Continuous | 7 days point-in-time |
| S3 files | Cross-region replication | Real-time | Forever |
| Redis | RDB snapshots | Hourly | 24 hours |
| Elasticsearch | Snapshots to S3 | Daily | 7 days |

### 7.2 Recovery Procedures

1. **Database failure**: Failover to Atlas secondary (automatic)
2. **Region failure**: Deploy to backup region via Terraform
3. **Data corruption**: Restore from point-in-time backup
4. **Complete outage**: Full stack recovery from backups

---

## 8. Cost Estimation

### 8.1 Monthly Cost (Production)

| Service | Specs | Estimated Cost |
|---------|-------|---------------|
| EKS Cluster | 1 cluster | $73 |
| EC2 (general) | 3x t3.large | ~$180 |
| EC2 (mediasoup) | 2x c5.xlarge | ~$250 |
| MongoDB Atlas | M30 cluster | ~$500 |
| ElastiCache | r6g.large cluster | ~$200 |
| S3 | 1TB storage | ~$25 |
| CloudFront | 10TB transfer | ~$850 |
| ALB | 1 load balancer | ~$25 |
| **Total** | | **~$2,100/month** |

*Costs vary by region and usage patterns*

---

**Related Documents:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
- [PRD.md](./PRD.md) — Product requirements
