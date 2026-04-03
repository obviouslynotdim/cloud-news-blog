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
