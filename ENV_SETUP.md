# Environment Variables Setup

## Required Environment Variables

### `VITE_API_URL`

**Description:** The base URL of your backend API server.

**Local Development:**
```env
VITE_API_URL=http://localhost:5001/
```

**Production (Vercel):**
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://backend-api-ns31.onrender.com/` (your Render backend URL)
   - **Environment:** Production (and Preview if needed)
3. **Redeploy** your frontend after adding the variable

**Your Backend URL:** `https://backend-api-ns31.onrender.com/`

**Important:** 
- ⚠️ **DO NOT** set this to your frontend URL (e.g., `https://frontend-mu-sepia-48.vercel.app`)
- ✅ Always point to your **backend API URL** (e.g., your Render service URL)
- The URL should end with a trailing slash `/`

## Optional Environment Variables

### `VITE_PYTHON_API_URL`

**Description:** URL for Python OCR/PDF extraction service (if used)

**Default:** `http://localhost:5002`

---

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Verify `VITE_API_URL` is set to your **backend** URL, not frontend
2. Check that your backend CORS configuration includes your frontend URL
3. Make sure both frontend and backend are using HTTPS in production

### 405 Method Not Allowed

This usually means:
- `VITE_API_URL` is incorrectly set to your frontend URL
- The frontend is trying to call itself instead of the backend
- **Fix:** Set `VITE_API_URL` to your Render backend URL

### Network Errors

- Check that your backend is running and accessible
- Verify the backend URL is correct (no typos)
- Ensure the backend is listening on the correct port

