module "storage" {
  source = "./modules/storage"

  project_name         = var.project_name
  environment          = var.environment
  bucket_force_destroy = var.bucket_force_destroy
  tags                 = var.tags
}
