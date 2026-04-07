provider "aws" {
  region = var.aws_region
}

module "network" {
  source = "./modules/network"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  public_subnet_cidr = var.public_subnet_cidr
  private_subnet_cidr_a = var.private_subnet_cidr_a
  private_subnet_cidr_b = var.private_subnet_cidr_b
  db_publicly_accessible = var.db_publicly_accessible
  tags               = var.tags
}

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

module "compute" {
  source = "./modules/compute"

  project_name      = var.project_name
  environment       = var.environment
  instance_type     = var.instance_type
  ami_id            = var.ami_id
  subnet_id         = module.network.public_subnet_id
  security_group_id = module.security.security_group_id
  key_name          = var.key_name
  user_data         = file("${path.module}/userdata.sh")
  tags              = var.tags
}

module "storage" {
  source = "./modules/storage"

  project_name         = var.project_name
  environment          = var.environment
  bucket_force_destroy = var.bucket_force_destroy
  tags                 = var.tags
}

module "database" {
  source = "./modules/database"

  project_name         = var.project_name
  environment          = var.environment
  private_subnet_ids   = module.network.private_subnet_ids
  db_security_group_id = module.security.db_security_group_id
  db_name              = var.db_name
  db_username          = var.db_username
  db_password          = var.db_password
  db_engine_version    = var.db_engine_version
  db_instance_class    = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  db_port              = var.db_port
  db_publicly_accessible = var.db_publicly_accessible
  tags                 = var.tags
}