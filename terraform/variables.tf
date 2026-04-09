variable "project_name" {
  description = "Project name used in resource naming"
  type        = string
  default     = "cloud-news-blog"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-southeast-1"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr_a" {
  description = "Public subnet A CIDR block"
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_cidr_b" {
  description = "Public subnet B CIDR block"
  type        = string
  default     = "10.0.4.0/24"
}

variable "private_subnet_cidr_a" {
  description = "Private subnet A CIDR block for RDS"
  type        = string
  default     = "10.0.2.0/24"
}

variable "private_subnet_cidr_b" {
  description = "Private subnet B CIDR block for RDS"
  type        = string
  default     = "10.0.3.0/24"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "Optional explicit AMI ID to pin the EC2 instance image and avoid replacement on new AMI releases"
  type        = string
  default     = ""
}

variable "key_name" {
  description = "Optional EC2 key pair name for SSH"
  type        = string
  default     = ""
}

variable "admin_cidr" {
  description = "CIDR allowed to SSH to EC2"
  type        = string
  default     = "127.0.0.1/32"

  validation {
    # condition     = can(cidrhost(var.admin_cidr, 0)) && var.admin_cidr != "0.0.0.0/0"
    # error_message = "admin_cidr must be a valid CIDR and must not be 0.0.0.0/0. Use your public IP range, for example x.x.x.x/32."
    condition     = can(cidrhost(var.admin_cidr, 0))
    error_message = "admin_cidr must be a valid CIDR block."
  }
}

variable "allowed_http_cidr" {
  description = "CIDR allowed to access the app port"
  type        = string
  default     = "0.0.0.0/0"

  validation {
    condition     = can(cidrhost(var.allowed_http_cidr, 0))
    error_message = "allowed_http_cidr must be a valid CIDR block."
  }
}

variable "app_port" {
  description = "Application listening port"
  type        = number
  default     = 3000
}

variable "bucket_force_destroy" {
  description = "Allow Terraform to destroy bucket with objects"
  type        = bool
  default     = false
}

variable "db_name" {
  description = "RDS database name"
  type        = string
  default     = "cloudnews"
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "cloudnews_admin"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "db_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "16.3"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_port" {
  description = "RDS PostgreSQL port"
  type        = number
  default     = 5432
}

variable "db_publicly_accessible" {
  description = "Whether the RDS instance should have a public endpoint"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}

variable "asg_min_size" {
  description = "Minimum number of instances in the ASG"
  type        = number
  default     = 1
}

variable "asg_max_size" {
  description = "Maximum number of instances in the ASG"
  type        = number
  default     = 3
}

variable "asg_desired_capacity" {
  description = "Desired number of instances in the ASG"
  type        = number
  default     = 2
}
