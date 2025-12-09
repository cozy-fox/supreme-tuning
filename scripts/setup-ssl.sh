#!/bin/bash
# Supreme Tuning - SSL Setup Script
# This script helps you set up SSL certificates for your domain

set -e

echo "🔒 Supreme Tuning - SSL Setup"
echo "=============================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "⚠️  Please do not run this script as root"
   exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "📋 This script will:"
echo "   1. Verify your domain DNS configuration"
echo "   2. Start the web server"
echo "   3. Obtain SSL certificates from Let's Encrypt"
echo "   4. Configure HTTPS"
echo ""

# Get domain from user or use default
read -p "Enter your domain name [supremetuning.nl]: " DOMAIN
DOMAIN=${DOMAIN:-supremetuning.nl}

# Get email from user or use default
read -p "Enter your email for SSL notifications [admin@${DOMAIN}]: " EMAIL
EMAIL=${EMAIL:-admin@${DOMAIN}}

echo ""
echo "🔍 Verifying DNS configuration for ${DOMAIN}..."

# Check if domain resolves
if ! nslookup ${DOMAIN} &> /dev/null; then
    echo "⚠️  Warning: DNS lookup failed for ${DOMAIN}"
    echo "   Make sure your domain's A record points to this server's IP address"
    read -p "Do you want to continue anyway? (y/N): " CONTINUE
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 1
    fi
else
    echo "✅ DNS configuration looks good!"
fi

echo ""
echo "🐳 Stopping any running containers..."
docker compose down

echo ""
echo "🚀 Starting web server..."
docker compose up -d supreme-tuning nginx

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if nginx is running
if ! docker compose ps nginx | grep -q "Up"; then
    echo "❌ Nginx failed to start. Check logs with: docker compose logs nginx"
    exit 1
fi

echo "✅ Web server is running!"

echo ""
echo "📜 Obtaining SSL certificates from Let's Encrypt..."
echo "   This may take a minute..."

# Update certbot email in docker-compose.yml or use environment variable
export CERTBOT_EMAIL=${EMAIL}

# Run certbot
if docker compose run --rm certbot; then
    echo "✅ SSL certificates obtained successfully!"
else
    echo "❌ Failed to obtain SSL certificates."
    echo ""
    echo "Common issues:"
    echo "   - Domain doesn't point to this server"
    echo "   - Port 80 is blocked by firewall"
    echo "   - Domain is not yet propagated"
    echo ""
    echo "Check logs with: docker compose logs certbot"
    exit 1
fi

echo ""
echo "🔄 Restarting nginx with SSL enabled..."
docker compose restart nginx

echo ""
echo "⏳ Waiting for nginx to reload..."
sleep 3

echo ""
echo "✅ SSL setup completed successfully!"
echo ""
echo "🎉 Your website should now be accessible at:"
echo "   https://${DOMAIN}"
echo ""
echo "🔒 SSL Certificate Information:"
docker compose run --rm certbot certificates
echo ""
echo "📝 Next steps:"
echo "   1. Visit https://${DOMAIN} to verify SSL is working"
echo "   2. Set up automatic certificate renewal (see SSL-SETUP.md)"
echo "   3. Test your SSL configuration at https://www.ssllabs.com/ssltest/"
echo ""
echo "🔄 Certificate Renewal:"
echo "   Certificates expire in 90 days. To renew:"
echo "   docker compose run --rm certbot renew && docker compose restart nginx"
echo ""

