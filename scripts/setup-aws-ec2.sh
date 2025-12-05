#!/bin/bash
# Supreme Tuning - AWS EC2 Amazon Linux Setup Script
# Run this script on your AWS EC2 Amazon Linux instance

set -e

echo "🚀 Setting up Supreme Tuning on AWS EC2 Amazon Linux..."

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install required packages
echo "📦 Installing required packages..."
sudo yum install -y git curl wget

# Install Docker
echo "🐳 Installing Docker..."
sudo yum install -y docker

# Start and enable Docker
echo "🐳 Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Add ec2-user to docker group
echo "👤 Adding ec2-user to docker group..."
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
echo "✅ Verifying installations..."
docker --version
docker-compose --version

# Create project directory
echo "📁 Creating project directory..."
mkdir -p /home/ec2-user/supreme-tuning
cd /home/ec2-user/supreme-tuning

echo ""
echo "✅ Initial setup completed!"
echo ""
echo "⚠️  IMPORTANT: Please log out and log back in for Docker group to take effect."
echo ""
echo "📝 Next steps:"
echo "   1. Log out and log back in"
echo "   2. Run: ./setup-github-runner.sh to set up the GitHub Actions runner"
echo "   3. Configure GitHub secrets (see DEPLOYMENT.md)"
echo ""

