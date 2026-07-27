#!/bin/bash
set -e

echo "Appending HTTP-only config to Nginx..."
cat << 'EOF' >> /root/app/docker/nginx/default.conf

# ============================ HASTY TASTY API (HTTP) ========================================
server {
    listen 80;
    server_name api.hastytastyglt.com;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}

# ============================ HASTY TASTY WEB (HTTP) ========================================
server {
    listen 80;
    server_name hastytastyglt.com www.hastytastyglt.com;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}
EOF

echo "Reloading Nginx..."
docker exec food_ordering_nginx nginx -s reload

echo "Requesting Let's Encrypt certificates..."
docker exec certbot certbot certonly --webroot -w /var/www/certbot -d hastytastyglt.com -d www.hastytastyglt.com -d api.hastytastyglt.com --email admin@hastytastyglt.com --agree-tos --no-eff-email --non-interactive || true

echo "Appending HTTPS config to Nginx..."
cat << 'EOF' >> /root/app/docker/nginx/default.conf

# ============================ HASTY TASTY API (HTTPS) ========================================
server {
    listen 443 ssl;
    server_name api.hastytastyglt.com;

    ssl_certificate     /etc/letsencrypt/live/hastytastyglt.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hastytastyglt.com/privkey.pem;

    client_max_body_size 50m;

    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";

    location / {
        set $hasty_api http://hasty-tasty-api:8080;
        proxy_pass $hasty_api;
    }
}

# ============================ HASTY TASTY WEB (HTTPS) ========================================
server {
    listen 443 ssl;
    server_name hastytastyglt.com www.hastytastyglt.com;

    ssl_certificate     /etc/letsencrypt/live/hastytastyglt.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hastytastyglt.com/privkey.pem;

    client_max_body_size 50m;

    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";

    location / {
        set $hasty_web http://hasty-tasty-web:3000;
        proxy_pass $hasty_web;
    }
}
EOF

echo "Reloading Nginx with HTTPS..."
docker exec food_ordering_nginx nginx -s reload

echo "Starting HastyTasty Docker containers..."
cd /root/hasty-tasty
docker compose -f docker-compose.prod.yml up -d --build

echo "Deployment complete!"
