output "instance_public_ip" {
  description = "Public IP of the application instance"
  value       = module.compute.instance_public_ip
}

output "instance_public_dns" {
  description = "Public DNS of the application instance"
  value       = module.compute.instance_public_dns
}

output "s3_bucket_name" {
  description = "S3 bucket name for app data"
  value       = module.storage.bucket_name
}
