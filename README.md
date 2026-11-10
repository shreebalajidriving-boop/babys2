# Babysitter App — VPS Web Deployment

This project is an **Expo / React Native application** with Expo Router and web support.
It can be hosted on a VPS as a website. Visitors open it in a browser, while the UI
can remain designed around a mobile-sized layout.

## 1. Requirements

- Ubuntu/Debian VPS
- Node.js 22 LTS (or a Node version supported by the installed Expo SDK)
- npm
- Nginx
- A domain name pointed to the VPS (recommended)

The project uses `npm` and includes `package-lock.json`.

## 2. Run locally

```bash
unzip babysitter2-main.zip
cd babysitter2-main

npm ci
npm run dev
```

Open the Expo URL printed in the terminal. To run the web version, press `w` in
the Expo terminal, or run:

```bash
npx expo start --web
```

## 3. Configure Supabase (if using cloud persistence)

The app reads these optional environment variables:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Create a `.env` file in the project root before building if you have configured
the Supabase project. These values are embedded into the client-side web build;
**never put a Supabase service-role key or other secret in an `EXPO_PUBLIC_*`
variable**. Configure the required Supabase tables/RPC functions and Row Level
Security policies separately. If these values are not provided, Supabase-backed
saving is not configured.

## 4. Create the production website build

On your development machine or directly on the VPS:

```bash
cd babysitter2-main
npm ci
npm run build:web
```

Expo writes the static website output to the `dist/` directory. Check that it
contains `index.html`:

```bash
ls -la dist
```

Upload/copy the **contents of `dist/`** to your web root, for example:

```bash
sudo mkdir -p /var/www/babysitter
sudo cp -a dist/. /var/www/babysitter/
sudo chown -R www-data:www-data /var/www/babysitter
```

If building on your own computer, transfer the `dist` directory to the VPS with
`scp` or your preferred deployment method.

## 5. Configure Nginx

Create a site configuration:

```bash
sudo nano /etc/nginx/sites-available/babysitter
```

Use this configuration, replacing `example.com` with your domain:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    root /var/www/babysitter;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }
}
```

Enable and reload the site:

```bash
sudo ln -s /etc/nginx/sites-available/babysitter /etc/nginx/sites-enabled/babysitter
sudo nginx -t
sudo systemctl reload nginx
```

If the symlink already exists, do not create it again. Remove the default Nginx
site if it conflicts with your domain configuration.

## 6. Enable HTTPS

After your domain's DNS A record points to the VPS and port 80 is reachable:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

Follow the prompts. Certbot will configure HTTPS and renewal.

## 7. Updating the website

Whenever you change the app:

```bash
npm ci
npm run build:web
sudo cp -a dist/. /var/www/babysitter/
sudo chown -R www-data:www-data /var/www/babysitter
sudo nginx -t
sudo systemctl reload nginx
```

A static web export does **not** need PM2 or a Node server to stay running.
Nginx serves the generated files directly.

## 8. Keep the UI mobile-sized on desktop

The browser will display the web build at the viewport size provided by the
device. If the app's screens are designed for phones, test with browser DevTools
using a mobile device preset. If you want a phone-like frame centered on desktop,
add a responsive outer wrapper in the app's root layout/styles (max-width around
430–480px, centered, with a full-height background). Do not add a fixed width
that causes horizontal scrolling on actual phones.

## 9. Troubleshooting

### Build fails

```bash
node -v
npm -v
rm -rf node_modules
npm ci
npm run build:web
```

Use a Node.js version compatible with the Expo SDK declared in `package.json`.
Do not delete `package-lock.json`.

### Refreshing a nested route gives 404

Confirm the Nginx `location /` contains:

```nginx
try_files $uri $uri/ /index.html;
```

Then run `sudo nginx -t && sudo systemctl reload nginx`.

### Supabase saving is unavailable

Check that `.env` contains the correct `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_ANON_KEY`, that the relevant Supabase RPC functions and
policies exist, and rebuild the web app after changing environment variables.

---

**Deployment model:** Expo static web export → Nginx → public website.
