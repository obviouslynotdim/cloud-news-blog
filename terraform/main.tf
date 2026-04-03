provider "aws" {
  region = var.aws_region
}

module "network" {
  source = "./modules/network"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  public_subnet_cidr = var.public_subnet_cidr
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
  tags              = var.tags
}

module "compute" {
  source = "./modules/compute"

  project_name      = var.project_name
  environment       = var.environment
  instance_type     = var.instance_type
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