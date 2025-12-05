#!/bin/bash
# GitHub Actions Self-Hosted Runner Setup for AWS EC2 Amazon Linux
# Run this script after setup-aws-ec2.sh

set -e

echo "🤖 Setting up GitHub Actions Self-Hosted Runner..."

# Check if GITHUB_REPO_URL and RUNNER_TOKEN are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo ""
    echo "Usage: ./setup-github-runner.sh <GITHUB_REPO_URL> <RUNNER_TOKEN>"
    echo ""
    echo "Example:"
    echo "  ./setup-github-runner.sh https://github.com/your-username/supreme-tuning AXCN7RPBBNLPSXFJBB67JUTIXC7PA"
    echo ""
    echo "To get your runner token:"
    echo "  1. Go to your GitHub repository"
    echo "  2. Settings > Actions > Runners"
    echo "  3. Click 'New self-hosted runner'"
    echo "  4. Copy the token from the configuration command"
    echo ""
    exit 1
fi

GITHUB_REPO_URL=$1
RUNNER_TOKEN=$2

# Create runner directory
echo "📁 Creating runner directory..."
mkdir -p /home/ec2-user/actions-runner
cd /home/ec2-user/actions-runner

# Get the latest runner version
RUNNER_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | grep -oP '"tag_name": "v\K[^"]+')
echo "📥 Downloading GitHub Actions runner v${RUNNER_VERSION}..."

# Download the runner
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Extract the installer
echo "📦 Extracting runner..."
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Install dependencies
echo "📦 Installing runner dependencies..."
sudo ./bin/installdependencies.sh

# Configure the runner
echo "⚙️ Configuring runner..."
./config.sh --url ${GITHUB_REPO_URL} --token ${RUNNER_TOKEN} --unattended --name "aws-ec2-runner" --labels "self-hosted,Linux,X64,aws-ec2"

# Install and start as a service
echo "🔧 Installing runner as a service..."
sudo ./svc.sh install
sudo ./svc.sh start

echo ""
echo "✅ GitHub Actions runner setup completed!"
echo ""
echo "📊 Runner status:"
sudo ./svc.sh status
echo ""
echo "📝 Useful commands:"
echo "   sudo ./svc.sh status  - Check runner status"
echo "   sudo ./svc.sh stop    - Stop the runner"
echo "   sudo ./svc.sh start   - Start the runner"
echo ""

