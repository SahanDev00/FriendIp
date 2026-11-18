TRACEPOINT FRIEND FRONTEND

1. Open app.js and set API to your Railway backend URL:
   const API = 'https://YOUR-BACKEND.up.railway.app';
2. Deploy this folder to Netlify (HTTPS is required for browser geolocation).
3. Add the resulting Netlify URL to the backend ALLOWED_ORIGINS variable and set PUBLIC_SITE_URL to this URL.

When a valid link opens, the page first explains that it will request browser location permission, then automatically calls the browser Geolocation API. The browser's own permission prompt is controlled by the browser and cannot be styled by the website. The page shows a custom animated CSS notification behind/around that browser prompt. If permission is denied or unavailable, the visit is still recorded with approximate IP-based location only.

Precise browser coordinates and accuracy are stored only when the browser reports permission granted. The raw IP address is not stored.
