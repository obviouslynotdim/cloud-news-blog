output "alb_dns_name" {
  description = "Public DNS of the Application Load Balancer (access the app here)"
  value       = module.loadbalancer.alb_dns_name
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

output "asg_name" {
  description = "Auto Scaling Group name"
  value       = module.compute.asg_name
}

output "cloudwatch_dashboard" {
  description = "CloudWatch dashboard name"
  value       = module.monitoring.dashboard_name
}

output "sns_topic_arn" {
  description = "SNS topic ARN for alarm notifications"
  value       = module.monitoring.sns_topic_arn
}
