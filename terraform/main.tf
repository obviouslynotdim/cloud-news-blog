provider "aws" {
  region = var.aws_region
}

# ── networking ──────────────────────────────────────────────────
module "network" {
  source = "./modules/network"

  project_name           = var.project_name
  environment            = var.environment
  vpc_cidr               = var.vpc_cidr
  public_subnet_cidr_a   = var.public_subnet_cidr_a
  public_subnet_cidr_b   = var.public_subnet_cidr_b
  private_subnet_cidr_a  = var.private_subnet_cidr_a
  private_subnet_cidr_b  = var.private_subnet_cidr_b
  db_publicly_accessible = var.db_publicly_accessible
  tags                   = var.tags
}

# ── security ────────────────────────────────────────────────────
module "security" {
  source = "./modules/security"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.network.vpc_id
  admin_cidr        = var.admin_cidr
  allowed_http_cidr = var.allowed_http_cidr
  app_port          = var.app_port
  db_port           = var.db_port
  tags              = var.tags
}

# ── storage (S3) ────────────────────────────────────────────────
module "storage" {
  source = "./modules/storage"

  project_name         = var.project_name
  environment          = var.environment
  bucket_force_destroy = var.bucket_force_destroy
  tags                 = var.tags
}

# ── IAM ─────────────────────────────────────────────────────────
module "iam" {
  source = "./modules/iam"

  project_name  = var.project_name
  environment   = var.environment
  s3_bucket_arn = module.storage.bucket_arn
  tags          = var.tags
}

# ── load balancer ───────────────────────────────────────────────
module "loadbalancer" {
  source = "./modules/loadbalancer"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.network.vpc_id
  public_subnet_ids     = module.network.public_subnet_ids
  alb_security_group_id = module.security.alb_security_group_id
  app_port              = var.app_port
  tags                  = var.tags
}

# ── compute (ASG + launch template) ────────────────────────────
module "compute" {
  source = "./modules/compute"

  project_name      = var.project_name
  environment       = var.environment
  instance_type     = var.instance_type
  ami_id            = var.ami_id
  subnet_ids        = module.network.public_subnet_ids
  security_group_id = module.security.security_group_id
  key_name          = var.key_name
  user_data = templatefile("${path.module}/userdata.sh", {
    project_name   = var.project_name
    environment    = var.environment
    aws_region     = var.aws_region
    repo_url       = var.repo_url
    s3_bucket_name = module.storage.bucket_name
    db_host        = module.database.db_endpoint
    db_port        = module.database.db_port
    db_name        = module.database.db_name
    db_username    = module.database.db_username
    db_password    = var.db_password
    app_port       = var.app_port
  })
  instance_profile_name = module.iam.instance_profile_name
  target_group_arn      = module.loadbalancer.target_group_arn
  min_size              = var.asg_min_size
  max_size              = var.asg_max_size
  desired_capacity      = var.asg_desired_capacity
  tags                  = var.tags
}

# ── database (RDS) ──────────────────────────────────────────────
module "database" {
  source = "./modules/database"

  project_name           = var.project_name
  environment            = var.environment
  private_subnet_ids     = module.network.private_subnet_ids
  db_security_group_id   = module.security.db_security_group_id
  db_name                = var.db_name
  db_username            = var.db_username
  db_password            = var.db_password
  db_engine_version      = var.db_engine_version
  db_instance_class      = var.db_instance_class
  db_allocated_storage   = var.db_allocated_storage
  db_port                = var.db_port
  db_publicly_accessible = var.db_publicly_accessible
  tags                   = var.tags
}

# ── monitoring & logging ────────────────────────────────────────
module "monitoring" {
  source = "./modules/monitoring"

  project_name            = var.project_name
  environment             = var.environment
  asg_name                = module.compute.asg_name
  alb_arn_suffix          = module.loadbalancer.alb_arn_suffix
  target_group_arn_suffix = module.loadbalancer.target_group_arn_suffix
  rds_instance_id         = module.database.db_instance_id
  scale_up_policy_arn     = module.compute.scale_up_policy_arn
  scale_down_policy_arn   = module.compute.scale_down_policy_arn
  tags                    = var.tags
}