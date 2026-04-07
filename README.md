# Cloud News Blog

Production-safe starter for a cloud computing project using:
- React + Tailwind CSS frontend
- Node.js/Express API backend
- Terraform-managed AWS infrastructure

## Project Structure

- `backend/` - Express API and JSON data store
- `frontend/` - React + Tailwind client application
- `terraform/` - Infrastructure as code (tutorial-style root + custom modules)
- `docs/` - Supporting project docs

Terraform root layout:
- `terraform/versions.tf` - Terraform and provider version constraints
- `terraform/main.tf` - Provider configuration and module wiring
- `terraform/variables.tf` - Input variables
- `terraform/outputs.tf` - Output values
- `terraform/userdata.sh` - EC2 bootstrap script
- `terraform/modules/*` - Reusable infrastructure modules

## Production Criteria Baseline

This repository is prepared to avoid secret leaks on first commit:
- `.gitignore` excludes Terraform state, env files, keys, and local artifacts.
- App config is environment-variable based (`PORT`, `NODE_ENV`).
- Terraform resources use variables, not hardcoded credentials.
- S3 has encryption + public access block enabled.
- EC2 enforces IMDSv2 and encrypted root disk.

## App Quick Start

1. Install all dependencies from root:

	npm install
	npm run setup

2. Start backend + frontend together:

	npm run dev

3. Open app in browser:

- `http://localhost:5173/`

4. API health check:

- `http://localhost:3000/health`

5. API endpoints:

- `http://localhost:3000/api/news`
- `http://localhost:3000/api/news/:slug`

6. Production build and start:

	npm run build
	npm start

### Optional Manual Run

1. Start backend API only:

	cd backend
	npm install
	npm run dev

2. Start frontend only:

	cd ../frontend
	npm install
	npm run dev

## App Features

- Public homepage with latest posts
- News listing with search and category filters
- Story detail view
- Publish form to create posts
- Publish form supports direct image file upload to S3
- API endpoints for read/create posts
- JSON-backed storage at `backend/data/posts.json`
- Sequelize model at `backend/models/Post.js`

## Configuration

- Frontend optional API base URL: `frontend/.env` using `VITE_API_BASE_URL`
- Backend optional CORS origin: `FRONTEND_ORIGIN`
- Backend optional port override: `PORT`

Copy `frontend/.env.example` to `frontend/.env` when you need custom frontend API routing.

## Setup Walkthrough

For full setup, verification flow, and screenshot checklist, see:

- `docs/setup-guide.md`

## Terraform Quick Start

Terraform is what creates the AWS services your app needs in production:
- EC2 for running the backend
- RDS PostgreSQL for persistent news post data
- S3 bucket for storing image files (store URLs in the database)

1. Move to Terraform directory:

	cd terraform

2. Initialize and validate:

	terraform init
	terraform fmt -recursive
	terraform validate

3. Set production values safely:

- Create a local `terraform.tfvars` file (this is ignored by git).
- You can start from `terraform/terraform.tfvars.example`.
- Example values to set:
  - `aws_region`
  - `key_name`
	- `admin_cidr` (set to your IP range, for example `x.x.x.x/32`)

4. Plan and apply:

	terraform plan -out=tfplan
	terraform apply tfplan
	terraform output

5. Build your backend database URL from outputs and variables:

- `rds_endpoint`
- `rds_port`
- `rds_db_name`
- `db_username` and `db_password` from your `terraform.tfvars`

Example:

`DATABASE_URL=postgresql://cloudnews_admin:YOUR_PASSWORD@<rds_endpoint>:5432/cloudnews`

## No-Leak First Commit Checklist

Before committing, confirm:
- No `.env` files are tracked.
- No Terraform state (`*.tfstate`) is tracked.
- No private key/certificate files are tracked.
- No secrets in code or commit message.

Optional quick checks:

git status
git ls-files | findstr /R /I "\.env$ tfstate pem key p12 pfx"

## Local First Commit (No Remote Push)

Run from repository root:

git init
git add .
git commit -m "chore: bootstrap production-safe cloud-news-blog"

## Important Note

Never commit real credentials, cloud access keys, or Terraform state files.
