#!/bin/bash
set -euo pipefail

# ── system packages ─────────────────────────────────────────────
dnf update -y
dnf install -y git nodejs

# ── install CloudWatch agent ────────────────────────────────────
dnf install -y amazon-cloudwatch-agent
cat <<'CWCFG' > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/opt/cloud-news-blog/app.log",
            "log_group_name": "/${project_name}/${environment}/app",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 7
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "${project_name}/${environment}",
    "metrics_collected": {
      "mem": { "measurement": ["mem_used_percent"] },
      "disk": { "measurement": ["used_percent"], "resources": ["*"] }
    }
  }
}
CWCFG
systemctl enable amazon-cloudwatch-agent
systemctl start amazon-cloudwatch-agent

# ── application directory ───────────────────────────────────────
APP_DIR="/opt/cloud-news-blog"
mkdir -p "$APP_DIR"

# ── environment file ────────────────────────────────────────────
cat > "$APP_DIR/.env" <<EOF
NODE_ENV=production
PORT=${app_port}
AWS_REGION=${aws_region}
S3_BUCKET_NAME=${s3_bucket_name}
S3_REGION=${aws_region}
DATABASE_URL=postgresql://${db_username}:${db_password}@${db_host}:${db_port}/${db_name}
DB_SSL=true
EOF
chmod 600 "$APP_DIR/.env"

# ── deploy instructions ─────────────────────────────────────────
cat > "$APP_DIR/deploy.sh" <<'DEPLOY'
#!/bin/bash
set -euo pipefail
cd /opt/cloud-news-blog

# Pull code (replace URL with your repo)
# git clone https://github.com/YOUR_USER/cloud-news-blog.git repo || (cd repo && git pull)

# If repo already cloned to /opt/cloud-news-blog/repo:
cd repo 2>/dev/null || { echo "Clone your repo first"; exit 1; }

# Build frontend
cd frontend && npm ci && npm run build && cd ..

# Install backend deps & copy frontend build
cd backend && npm ci
cp -r ../frontend/dist ./public

# Start with systemd
sudo systemctl restart cloud-news-blog
DEPLOY
chmod +x "$APP_DIR/deploy.sh"

# ── systemd service ─────────────────────────────────────────────
cat > /etc/systemd/system/cloud-news-blog.service <<EOF
[Unit]
Description=Cloud News Blog App
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/cloud-news-blog/repo/backend
EnvironmentFile=/opt/cloud-news-blog/.env
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=5
StandardOutput=append:/opt/cloud-news-blog/app.log
StandardError=append:/opt/cloud-news-blog/app.log
User=root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable cloud-news-blog
