# 🚀 SSL Quick Start Guide

## One-Command Setup (Easiest)

```bash
# Make the script executable
chmod +x scripts/setup-ssl.sh

# Run the automated setup
./scripts/setup-ssl.sh
```

The script will guide you through the process and set up everything automatically.

---

## Manual Setup (Step by Step)

### 1. Verify DNS Points to Your Server

```bash
nslookup supremetuning.nl
```

### 2. Start Services

```bash
docker compose down
docker compose up -d supreme-tuning nginx
```

### 3. Get SSL Certificate

```bash
docker compose run --rm certbot
```

### 4. Restart Nginx

```bash
docker compose restart nginx
```

### 5. Test HTTPS

Open in browser: `https://supremetuning.nl`

---

## Common Commands

```bash
# View all logs
docker compose logs -f

# Check certificate status
docker compose run --rm certbot certificates

# Renew certificates
docker compose run --rm certbot renew
docker compose restart nginx

# Restart all services
docker compose restart

# Stop all services
docker compose down

# Start all services
docker compose up -d
```

---

## Automatic Renewal Setup

Add to crontab for automatic renewal:

```bash
crontab -e
```

Add this line:

```
0 0,12 * * * cd /path/to/supreme-tuning && docker compose run --rm certbot renew && docker compose restart nginx
```

---

## Troubleshooting

### Certificate not found
```bash
# Get certificates first
docker compose run --rm certbot
```

### Port 80 blocked
```bash
# Check if port 80 is accessible
curl http://supremetuning.nl
```

### DNS not configured
```bash
# Verify DNS
nslookup supremetuning.nl
dig supremetuning.nl +short
```

### View detailed logs
```bash
docker compose logs nginx
docker compose logs certbot
```

---

## What Changed?

✅ **nginx.conf** - Updated with SSL configuration and security headers
✅ **docker-compose.yml** - Added certbot webroot volume and email configuration
✅ **.env.example** - Added CERTBOT_EMAIL variable

---

## Security Features Enabled

- ✅ TLS 1.2 and 1.3
- ✅ Strong cipher suites
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ XSS Protection headers
- ✅ Clickjacking protection
- ✅ HTTP/2 support
- ✅ Automatic HTTP to HTTPS redirect

---

## Need More Help?

See the full guide: [SSL-SETUP.md](SSL-SETUP.md)

