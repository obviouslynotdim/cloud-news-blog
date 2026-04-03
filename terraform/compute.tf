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
