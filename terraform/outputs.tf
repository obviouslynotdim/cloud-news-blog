output "instance_public_ip" {
  description = "Public IP of the application instance"
  value       = module.compute.instance_public_ip
}

output "instance_public_dns" {
  description = "Public DNS of the application instance"
  value       = module.compute.instance_public_dns
}

output "s3_bucket_name" {
  description = "S3 bucket name for image storage"
  value       = module.storage.bucket_name
}

output "rds_endpoint" {
  description = "RDS endpoint address"
  value       = module.database.db_endpoint
}

output "rds_port" {
  description = "RDS endpoint port"
  value       = module.database.db_port
}

output "rds_db_name" {
  description = "RDS database name"
  value       = module.database.db_name
}

output "rds_username" {
  description = "RDS username"
  value       = module.database.db_username
}
