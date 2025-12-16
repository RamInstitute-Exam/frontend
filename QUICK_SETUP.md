# Quick Setup Guide

## ✅ Your Backend URL
```
https://backend-api-ns31.onrender.com/
```

## 🚀 Vercel Environment Variable Setup

### Step 1: Go to Vercel Dashboard
1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your frontend project (`frontend-mu-sepia-48` or similar)

### Step 2: Add Environment Variable
1. Click **Settings** → **Environment Variables**
2. Click **Add New**
3. Fill in:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://backend-api-ns31.onrender.com/`
   - **Environment:** Select **Production** (and **Preview** if you want)
4. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 4: Test
1. Open your frontend: `https://frontend-mu-sepia-48.vercel.app`
2. Try logging in
3. Check browser console (F12) → Network tab
4. Verify API calls go to: `https://backend-api-ns31.onrender.com/api/auth/login`

---

## ✅ Verification Checklist

- [ ] `VITE_API_URL` is set in Vercel
- [ ] Value is `https://backend-api-ns31.onrender.com/` (with trailing slash)
- [ ] Frontend has been redeployed after adding the variable
- [ ] Backend is running on Render
- [ ] Backend CORS includes `https://frontend-mu-sepia-48.vercel.app`

---

## 🔍 Troubleshooting

**If you still see 405 errors:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check Vercel environment variables are saved correctly
- Verify the backend URL is accessible: Open `https://backend-api-ns31.onrender.com/` in browser (should show "Running backend")

**If you see CORS errors:**
- Backend CORS already includes your frontend URL ✅
- Make sure both are using HTTPS
- Check browser console for exact error message

