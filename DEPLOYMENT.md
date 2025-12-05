# Supreme Tuning - Deployment Guide

## AWS EC2 Deployment with GitHub Actions

This guide covers deploying Supreme Tuning to AWS EC2 using GitHub Actions self-hosted runner.

---

## Prerequisites

- AWS EC2 instance (Amazon Linux 2023 recommended)
- GitHub repository
- SSH access to EC2 instance

---

## Step 1: Launch AWS EC2 Instance

1. **Launch EC2 Instance:**
   - AMI: Amazon Linux 2023
   - Instance Type: t3.small or larger (at least 2GB RAM for Docker builds)
   - Storage: 20GB+ EBS

2. **Configure Security Group:**
   | Type  | Port | Source    | Description     |
   |-------|------|-----------|-----------------|
   | SSH   | 22   | Your IP   | SSH access      |
   | HTTP  | 80   | 0.0.0.0/0 | Web traffic     |
   | HTTPS | 443  | 0.0.0.0/0 | Secure traffic  |
   | Custom| 3000 | 0.0.0.0/0 | Next.js (optional, can use nginx proxy) |

---

## Step 2: Setup EC2 Instance

SSH into your EC2 instance and run:

```bash
# Download and run setup script
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/supreme-tuning/main/scripts/setup-aws-ec2.sh
chmod +x setup-aws-ec2.sh
./setup-aws-ec2.sh

# Log out and log back in for Docker group to take effect
exit
```

---

## Step 3: Setup GitHub Actions Runner

1. **Get Runner Token from GitHub:**
   - Go to your repository on GitHub
   - Navigate to: Settings → Actions → Runners
   - Click "New self-hosted runner"
   - Copy the token from the configure command

2. **Install the runner:**
```bash
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/supreme-tuning/main/scripts/setup-github-runner.sh
chmod +x setup-github-runner.sh
./setup-github-runner.sh https://github.com/YOUR_USERNAME/supreme-tuning YOUR_RUNNER_TOKEN
```

---

## Step 4: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these **Repository Secrets**:

| Secret Name   | Description                              | Example Value                    |
|---------------|------------------------------------------|----------------------------------|
| `SITE_URL`    | Your production website URL              | `https://supremetuning.nl`       |
| `JWT_SECRET`  | Secret key for JWT authentication        | `your-super-secret-key-min-32-chars` |

---

## Step 5: Deploy

Push to the `main` branch or manually trigger the workflow:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

The GitHub Action will automatically:
1. Pull the latest code
2. Build the Docker image
3. Start the container
4. Verify health check

---

## Useful Commands

### On EC2 Instance

```bash
# View running containers
docker ps

# View application logs
docker-compose logs -f

# Restart application
docker-compose restart

# Stop application
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Check runner status
cd /home/ec2-user/actions-runner
sudo ./svc.sh status
```

---

## Troubleshooting

### Application not starting
```bash
docker-compose logs supreme-tuning
```

### Port 3000 in use
```bash
sudo lsof -i :3000
docker stop $(docker ps -q)
```

### Runner not connecting
```bash
cd /home/ec2-user/actions-runner
sudo ./svc.sh status
sudo ./svc.sh restart
```

