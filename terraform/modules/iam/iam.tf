# ---------- variables ----------
variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "s3_bucket_arn" {
  type = string
}

variable "tags" {
  type = map(string)
}

# ---------- IAM role for EC2 ----------
data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2" {
  name               = "${var.project_name}-${var.environment}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-ec2-role"
  })
}

# S3 access policy — least-privilege for the app bucket
data "aws_iam_policy_document" "s3_access" {
  statement {
    sid = "AllowS3BucketAccess"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      var.s3_bucket_arn,
      "${var.s3_bucket_arn}/*",
    ]
  }
}

resource "aws_iam_role_policy" "s3_access" {
  name   = "${var.project_name}-${var.environment}-s3-access"
  role   = aws_iam_role.ec2.id
  policy = data.aws_iam_policy_document.s3_access.json
}

# CloudWatch Logs policy
data "aws_iam_policy_document" "cloudwatch_logs" {
  statement {
    sid = "AllowCloudWatchLogs"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams",
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_role_policy" "cloudwatch_logs" {
  name   = "${var.project_name}-${var.environment}-cw-logs"
  role   = aws_iam_role.ec2.id
  policy = data.aws_iam_policy_document.cloudwatch_logs.json
}

# SSM managed policy for Session Manager access (no SSH keys needed)
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance profile
resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project_name}-${var.environment}-ec2-profile"
  role = aws_iam_role.ec2.name

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-ec2-profile"
  })
}

# ---------- outputs ----------
output "instance_profile_name" {
  value = aws_iam_instance_profile.ec2.name
}

output "iam_role_arn" {
  value = aws_iam_role.ec2.arn
}
