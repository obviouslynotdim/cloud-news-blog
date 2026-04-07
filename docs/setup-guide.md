# Cloud News Blog Setup Guide

This guide connects the full stack for local development and single-server production.

## 1. Prerequisites

- Node.js 18+ and npm
- Git
- Optional: Terraform 1.6+ and AWS CLI for infrastructure steps

## 2. Install Dependencies

From project root:

```bash
npm install
npm run setup
```

## 3. Development Run (Frontend + Backend)

From project root:

```bash
npm run dev
```

Open:

- Frontend: http://localhost:5173
- Backend health: http://localhost:3000/health

## 4. Verify Connected Features

1. Home tab shows latest stories from backend JSON data.
2. News tab supports search and category filters.
3. Read full story opens detail view.
4. Publish tab creates a new post via API and opens detail view.

## 5. Screenshot Checklist (for report/demo)

Capture these screens after running `npm run dev`:

1. Home page with hero and latest stories.
2. News page with a search term applied.
3. News page with category filter selected.
4. Detail page for one article.
5. Publish page with a completed form before submit.
6. Detail page of the newly published article.
7. Backend health endpoint response in browser or API client.

## 6. Production Build (Single Origin)

Build frontend first:

```bash
npm run build
```

Then start backend:

```bash
npm start
```

How it works:

- Backend serves API routes from `/api/*` and `/health`.
- If `frontend/dist` exists, backend also serves the React app and handles SPA routing.

## 7. Optional Cross-Origin Deployment

If frontend and backend are deployed on different domains:

1. Frontend: set `frontend/.env` with:

```bash
VITE_API_BASE_URL=https://your-backend-domain
```

2. Backend: set environment variable:

```bash
FRONTEND_ORIGIN=https://your-frontend-domain
```

Then restart both services.

## 8. Troubleshooting

- Blank page after `npm start`: run `npm run build` first.
- API not reachable from frontend: check `VITE_API_BASE_URL` and `FRONTEND_ORIGIN`.
- Port conflict: set `PORT` for backend before starting.

## 9. Terraform Infrastructure Setup (RDS + S3)

Terraform provisions the production cloud resources for this app:

- EC2: runs Node.js backend
- RDS PostgreSQL: stores post data
- S3: stores images/files and their URLs are saved in DB records
- Sequelize model: `backend/models/Post.js`

1. Move to Terraform directory:

```bash
cd terraform
```

2. Create local variables file:

```bash
copy terraform.tfvars.example terraform.tfvars
```

3. Update `terraform.tfvars` with real values:

- `admin_cidr` as your IP/CIDR (for SSH)
- `db_password` as a strong password
- optional sizing values like `db_instance_class`

4. Apply infrastructure:

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```

5. Read outputs:

```bash
terraform output
```

Use:

- `rds_endpoint`
- `rds_port`
- `rds_db_name`
- `rds_username`
- `s3_bucket_name`

6. Set backend database config (`backend/.env`):

```bash
PORT=3000
DATABASE_URL=postgresql://<rds_username>:<db_password>@<rds_endpoint>:<rds_port>/<rds_db_name>
DB_SSL=true
S3_BUCKET_NAME=<s3_bucket_name>
S3_REGION=ap-southeast-1
```

7. Start backend and verify logs show PostgreSQL mode:

```bash
npm --prefix backend run dev
```

Expected startup log includes: `Using PostgreSQL storage`.
