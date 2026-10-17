#!/usr/bin/env bash
set -euo pipefail
# Only creates this application's own service, environment and virtual host.
APP=/opt/lernatelier-test
HOST=lernatelier-api.162-55-62-231.sslip.io
install -d -m 755 "$APP/server" "$APP/site/content" /var/www/lernatelier-acme
python3 - <<'PY'
from pathlib import Path
import secrets, os
target=Path('/etc/lernatelier-test.env')
if not target.exists():
    source=Path('/app/myabiflow-backend/.env')
    key=''
    for line in source.read_text().splitlines():
        if line.startswith('OPENAI_API_KEY='):
            key=line.split('=',1)[1].strip().strip('"').strip("'")
            break
    if not key: raise SystemExit('Vorhandener OpenAI-Zugang nicht gefunden')
    target.write_text('OPENAI_API_KEY='+key+'\nOPENAI_MODEL=gpt-5-mini\nPORT=4317\nDAILY_LIMIT=100\nCLIENT_DAILY_LIMIT=30\nALLOWED_ORIGINS=https://danizahnweh-oss.github.io,http://127.0.0.1:4173\nBUDGET_SALT='+secrets.token_hex(32)+'\n')
    os.chmod(target,0o600)
print('Separate KI-Konfiguration eingerichtet; keine Schlüssel ausgegeben.')
PY
cat > /etc/systemd/system/lernatelier-test.service <<'UNIT'
[Unit]
Description=Lernatelier separate test grading service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
DynamicUser=yes
WorkingDirectory=/opt/lernatelier-test
EnvironmentFile=/etc/lernatelier-test.env
StateDirectory=lernatelier-test
ExecStart=/usr/bin/node /opt/lernatelier-test/server/server.mjs
Restart=on-failure
RestartSec=5
NoNewPrivileges=yes
PrivateTmp=yes
ProtectHome=yes
ProtectSystem=strict
MemoryMax=256M
UMask=0077

[Install]
WantedBy=multi-user.target
UNIT
if [ ! -f "/etc/letsencrypt/live/$HOST/fullchain.pem" ]; then
    cat > /etc/nginx/sites-available/lernatelier-test <<'HTTP'
server {
    listen 80;
    server_name lernatelier-api.162-55-62-231.sslip.io;
    access_log off;
    location /.well-known/acme-challenge/ { root /var/www/lernatelier-acme; }
    location / { return 404; }
}
HTTP
    ln -sfn /etc/nginx/sites-available/lernatelier-test /etc/nginx/sites-enabled/lernatelier-test
    nginx -t
    systemctl reload nginx
    certbot certonly --webroot -w /var/www/lernatelier-acme -d "$HOST" --non-interactive --agree-tos --keep-until-expiring --deploy-hook 'systemctl reload nginx'
fi
cat > /etc/nginx/sites-available/lernatelier-test <<'HTTPS'
server {
    listen 80;
    server_name lernatelier-api.162-55-62-231.sslip.io;
    access_log off;
    location /.well-known/acme-challenge/ { root /var/www/lernatelier-acme; }
    location / { return 301 https://$host$request_uri; }
}
server {
    listen 443 ssl;
    server_name lernatelier-api.162-55-62-231.sslip.io;
    ssl_certificate /etc/letsencrypt/live/lernatelier-api.162-55-62-231.sslip.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lernatelier-api.162-55-62-231.sslip.io/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    access_log off;
    client_max_body_size 100k;
    location /api/ {
        proxy_pass http://127.0.0.1:4317;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 100s;
        proxy_send_timeout 100s;
    }
    location / { return 404; }
}
HTTPS
ln -sfn /etc/nginx/sites-available/lernatelier-test /etc/nginx/sites-enabled/lernatelier-test
nginx -t
systemctl daemon-reload
systemctl enable --now lernatelier-test
systemctl restart lernatelier-test
systemctl reload nginx
systemctl is-active lernatelier-test
curl -fsS --retry 4 --retry-all-errors --retry-delay 1 https://lernatelier-api.162-55-62-231.sslip.io/api/health
