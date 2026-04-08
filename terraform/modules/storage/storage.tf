variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "bucket_force_destroy" {
  type = bool
}

variable "tags" {
  type = map(string)
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "app_data" {
  bucket        = lower("${var.project_name}-${var.environment}-${random_id.bucket_suffix.hex}")
  force_destroy = var.bucket_force_destroy

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-data"
  })
}

resource "aws_s3_bucket_versioning" "app_data" {
  bucket = aws_s3_bucket.app_data.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app_data" {
  bucket = aws_s3_bucket.app_data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "app_data" {
  bucket = aws_s3_bucket.app_data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_name" {
  value = aws_s3_bucket.app_data.bucket
}

output "bucket_arn" {
  value = aws_s3_bucket.app_data.arn
}
