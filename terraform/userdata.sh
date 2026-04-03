#!/bin/bash
set -euo pipefail

dnf update -y
dnf install -y git nodejs

mkdir -p /opt/cloud-news-blog

cat <<'EOF' > /opt/cloud-news-blog/README_DEPLOY.txt
EC2 bootstrap complete.

Next deployment step:
1) Pull your repository into /opt/cloud-news-blog
2) Run npm install inside app/
3) Start the app with NODE_ENV=production and PORT=3000
EOF
