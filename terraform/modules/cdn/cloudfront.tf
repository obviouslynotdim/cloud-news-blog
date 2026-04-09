# ---------- variables ----------
variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "alb_dns_name" {
  type = string
}

variable "alb_security_group_id" {
  type        = string
  description = "ALB security group ID — a CloudFront-origin ingress rule will be added to it"
}

variable "tags" {
  type = map(string)
}

# ---------- CloudFront managed prefix list ----------
# Allows CloudFront edge nodes to reach the ALB on port 80
data "aws_ec2_managed_prefix_list" "cloudfront" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

resource "aws_security_group_rule" "alb_from_cloudfront" {
  type            = "ingress"
  description     = "Allow HTTP from CloudFront origin IPs"
  from_port       = 80
  to_port         = 80
  protocol        = "tcp"
  prefix_list_ids = [data.aws_ec2_managed_prefix_list.cloudfront.id]

  security_group_id = var.alb_security_group_id
}

# ---------- CloudFront distribution ----------
resource "aws_cloudfront_distribution" "app" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "${var.project_name}-${var.environment}"
  price_class     = "PriceClass_All"

  origin {
    domain_name = var.alb_dns_name
    origin_id   = "${var.project_name}-${var.environment}-alb"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.project_name}-${var.environment}-alb"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # CachingDisabled — every request is forwarded to the ALB (needed for API + dynamic content)
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    # AllViewerExceptHostHeader — forwards all viewer headers/cookies/query strings except Host,
    # so CloudFront sets Host to the ALB DNS name rather than the viewer's CloudFront domain.
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Use the free CloudFront default certificate (*.cloudfront.net)
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-cloudfront"
  })
}

# ---------- outputs ----------
output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.app.domain_name
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.app.id
}
