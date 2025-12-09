# 🔒 SSL/HTTPS Setup Guide for Supreme Tuning

This guide will help you enable HTTPS for your Supreme Tuning website using Let's Encrypt SSL certificates.

---

## ✅ Prerequisites

Before starting, ensure you have:

1. **A domain name** (e.g., `supremetuning.nl`)
2. **DNS configured** - Your domain's A record should point to your server's IP address
3. **Ports 80 and 443 open** in your firewall/security group
4. **Docker and Docker Compose** installed on your server

---

## 📋 Configuration Overview

The SSL setup uses:
- **Nginx** as a reverse proxy with SSL termination
- **Let's Encrypt** for free SSL certificates
- **Certbot** for automatic certificate generation and renewal

---

## 🚀 Step 1: Update Environment Variables (Optional)

If you want to use a custom email for SSL certificate notifications, create or update your `.env` file:

```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
SITE_URL=https://supremetuning.nl
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CERTBOT_EMAIL=admin@supremetuning.nl
EOF
```

**Note:** If you don't set `CERTBOT_EMAIL`, it will default to `admin@supremetuning.nl`

---

## 🔧 Step 2: Verify DNS Configuration

Before obtaining SSL certificates, verify your domain points to your server:

```bash
# Check if your domain resolves to your server IP
nslookup supremetuning.nl

# Or use dig
dig supremetuning.nl +short
```

The output should show your server's public IP address.

---

## 📜 Step 3: Obtain SSL Certificates

### First-time SSL Certificate Setup

1. **Start only the web server (without SSL first):**

```bash
# Stop all containers if running
docker compose down

# Start only the supreme-tuning and nginx services
docker compose up -d supreme-tuning nginx
```

2. **Obtain the SSL certificate:**

```bash
# Run certbot to get certificates
docker compose run --rm certbot
```

This will:
- Validate domain ownership via HTTP challenge
- Generate SSL certificates
- Store them in `/etc/letsencrypt/`

3. **Restart Nginx with SSL enabled:**

```bash
# Restart nginx to load the new certificates
docker compose restart nginx
```

---

## 🎯 Step 4: Verify HTTPS is Working

1. **Check if containers are running:**

```bash
docker compose ps
```

You should see:
- `supreme-tuning` - Running
- `supreme-nginx` - Running

2. **Test HTTPS in your browser:**

Open: `https://supremetuning.nl`

You should see:
- 🔒 Padlock icon in the address bar
- Valid SSL certificate
- Your website loading over HTTPS

3. **Test HTTP to HTTPS redirect:**

Open: `http://supremetuning.nl`

It should automatically redirect to `https://supremetuning.nl`

---

## 🔄 Step 5: Automatic Certificate Renewal

Let's Encrypt certificates expire after 90 days. Set up automatic renewal:

### Option A: Using Cron (Recommended)

```bash
# Add to crontab
crontab -e

# Add this line to renew certificates twice daily
0 0,12 * * * cd /path/to/supreme-tuning && docker compose run --rm certbot renew && docker compose restart nginx
```

### Option B: Manual Renewal

```bash
# Renew certificates manually when needed
docker compose run --rm certbot renew
docker compose restart nginx
```

---

## 🛠️ Troubleshooting

### Issue: "Certificate not found" error

**Solution:** Make sure you've obtained certificates first:
```bash
docker compose run --rm certbot
```

### Issue: Certbot validation fails

**Possible causes:**
1. DNS not configured correctly
2. Port 80 blocked by firewall
3. Domain doesn't point to your server

**Check:**
```bash
# Verify port 80 is accessible
curl http://supremetuning.nl/.well-known/acme-challenge/test

# Check nginx logs
docker compose logs nginx

# Check certbot logs
docker compose logs certbot
```

### Issue: "Connection refused" on HTTPS

**Solution:** Ensure nginx is running and port 443 is open:
```bash
# Check if nginx is running
docker compose ps nginx

# Check nginx configuration
docker compose exec nginx nginx -t

# View nginx logs
docker compose logs nginx
```

---

## 📊 Useful Commands

```bash
# View all logs
docker compose logs -f

# View nginx logs only
docker compose logs -f nginx

# Restart all services
docker compose restart

# Check certificate expiration
docker compose run --rm certbot certificates

# Force certificate renewal (for testing)
docker compose run --rm certbot renew --force-renewal
```

---

## 🔐 Security Best Practices

The nginx configuration includes:

✅ **TLS 1.2 and 1.3** - Modern encryption protocols
✅ **Strong ciphers** - Secure cipher suites
✅ **HSTS header** - Forces HTTPS for 1 year
✅ **Security headers** - XSS, clickjacking protection
✅ **HTTP/2** - Faster page loads

---

## 📝 Next Steps

After SSL is working:

1. ✅ Update your `SITE_URL` in environment variables to use `https://`
2. ✅ Set up automatic certificate renewal
3. ✅ Test your SSL configuration at: https://www.ssllabs.com/ssltest/
4. ✅ Update any hardcoded HTTP URLs in your application to HTTPS

---

## 🆘 Need Help?

If you encounter issues:

1. Check the logs: `docker compose logs -f`
2. Verify DNS: `nslookup supremetuning.nl`
3. Test ports: `curl -I http://supremetuning.nl`
4. Review nginx config: `docker compose exec nginx nginx -t`

