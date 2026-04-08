# ---------- variables ----------
variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "asg_name" {
  type = string
}

variable "alb_arn_suffix" {
  type = string
}

variable "target_group_arn_suffix" {
  type = string
}

variable "rds_instance_id" {
  type = string
}

variable "scale_up_policy_arn" {
  type = string
}

variable "scale_down_policy_arn" {
  type = string
}

variable "tags" {
  type = map(string)
}

# ---------- SNS topic for alarm notifications ----------
resource "aws_sns_topic" "alarms" {
  name = "${var.project_name}-${var.environment}-alarms"

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-alarms"
  })
}

# ---------- CloudWatch log group ----------
resource "aws_cloudwatch_log_group" "app" {
  name              = "/${var.project_name}/${var.environment}/app"
  retention_in_days = 7

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-app-logs"
  })
}

# ---------- ASG CPU alarms (trigger scaling) ----------
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${var.project_name}-${var.environment}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 70
  alarm_description   = "Scale up when average CPU > 70% for 2 minutes"
  alarm_actions       = [var.scale_up_policy_arn, aws_sns_topic.alarms.arn]

  dimensions = {
    AutoScalingGroupName = var.asg_name
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-cpu-high"
  })
}

resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  alarm_name          = "${var.project_name}-${var.environment}-cpu-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 25
  alarm_description   = "Scale down when average CPU < 25% for 3 minutes"
  alarm_actions       = [var.scale_down_policy_arn]

  dimensions = {
    AutoScalingGroupName = var.asg_name
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-cpu-low"
  })
}

# ---------- ALB unhealthy host alarm ----------
resource "aws_cloudwatch_metric_alarm" "unhealthy_hosts" {
  alarm_name          = "${var.project_name}-${var.environment}-unhealthy-hosts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "Alert when any target is unhealthy"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffix
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-unhealthy-hosts"
  })
}

# ---------- ALB 5xx error alarm ----------
resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "${var.project_name}-${var.environment}-alb-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Alert when 5xx errors exceed 10 per minute"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffix
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-alb-5xx"
  })
}

# ---------- RDS CPU alarm ----------
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${var.project_name}-${var.environment}-rds-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 120
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when RDS CPU > 80%"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-rds-cpu"
  })
}

# ---------- RDS free storage alarm ----------
resource "aws_cloudwatch_metric_alarm" "rds_storage" {
  alarm_name          = "${var.project_name}-${var.environment}-rds-low-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 2000000000 # 2 GB in bytes
  alarm_description   = "Alert when RDS free storage < 2GB"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-rds-low-storage"
  })
}

# ---------- CloudWatch dashboard ----------
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title   = "ASG - CPU Utilization"
          metrics = [["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", var.asg_name]]
          period  = 60
          stat    = "Average"
          region  = data.aws_region.current.name
          view    = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title = "ASG - Instance Count"
          metrics = [
            ["AWS/AutoScaling", "GroupInServiceInstances", "AutoScalingGroupName", var.asg_name],
            ["AWS/AutoScaling", "GroupDesiredCapacity", "AutoScalingGroupName", var.asg_name],
          ]
          period = 60
          stat   = "Average"
          region = data.aws_region.current.name
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title = "ALB - Request Count & Latency"
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix],
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", var.alb_arn_suffix],
          ]
          period = 60
          stat   = "Sum"
          region = data.aws_region.current.name
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title = "ALB - Healthy / Unhealthy Hosts"
          metrics = [
            ["AWS/ApplicationELB", "HealthyHostCount", "TargetGroup", var.target_group_arn_suffix, "LoadBalancer", var.alb_arn_suffix],
            ["AWS/ApplicationELB", "UnHealthyHostCount", "TargetGroup", var.target_group_arn_suffix, "LoadBalancer", var.alb_arn_suffix],
          ]
          period = 60
          stat   = "Maximum"
          region = data.aws_region.current.name
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 12
        height = 6
        properties = {
          title   = "RDS - CPU Utilization"
          metrics = [["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", var.rds_instance_id]]
          period  = 60
          stat    = "Average"
          region  = data.aws_region.current.name
          view    = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 12
        width  = 12
        height = 6
        properties = {
          title   = "RDS - Free Storage Space"
          metrics = [["AWS/RDS", "FreeStorageSpace", "DBInstanceIdentifier", var.rds_instance_id]]
          period  = 300
          stat    = "Average"
          region  = data.aws_region.current.name
          view    = "timeSeries"
        }
      },
    ]
  })
}

data "aws_region" "current" {}

# ---------- outputs ----------
output "sns_topic_arn" {
  value = aws_sns_topic.alarms.arn
}

output "log_group_name" {
  value = aws_cloudwatch_log_group.app.name
}

output "dashboard_name" {
  value = aws_cloudwatch_dashboard.main.dashboard_name
}
