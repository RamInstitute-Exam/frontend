# Homepage Images Setup Guide

## 📸 Image Files Location

Place your logo and banner images in the `frontend/public/` folder:

### Required Images:

1. **Logo Image**
   - **File:** `logo.png` or `logo.jpg`
   - **Recommended Size:** 200x60px to 300x90px
   - **Format:** PNG (with transparency) or JPG
   - **Location:** `frontend/public/logo.png`

2. **Banner Image**
   - **File:** `banner.jpg` or `banner.png`
   - **Recommended Size:** 1200x600px to 1920x800px
   - **Format:** JPG or PNG
   - **Location:** `frontend/public/banner.jpg`

## 🚀 How to Use

### Option 1: Local Images (Recommended for Development)

1. Place your logo in: `frontend/public/logo.png`
2. Place your banner in: `frontend/public/banner.jpg`
3. The homepage will automatically detect and use these images

### Option 2: Upload via UI

1. Visit the homepage
2. Hover over the logo area → Click upload icon
3. Hover over the banner area → Click "Upload Banner" or "Change Banner"
4. Select your image file
5. Images will be uploaded to Cloudinary and saved in localStorage

### Option 3: Environment Variables

You can also set images via environment variables in `.env`:

```env
VITE_HOMEPAGE_LOGO=https://your-cdn.com/logo.png
VITE_HOMEPAGE_BANNER=https://your-cdn.com/banner.jpg
```

## 📋 Image Specifications

### Logo:
- **Width:** 200-300px
- **Height:** 60-90px (maintain aspect ratio)
- **Format:** PNG (transparent background) or JPG
- **File Size:** < 2MB

### Banner:
- **Width:** 1200-1920px
- **Height:** 600-800px (16:9 or 2:1 ratio recommended)
- **Format:** JPG or PNG
- **File Size:** < 5MB

## 🎨 Best Practices

1. **Logo:**
   - Use PNG with transparent background for best results
   - Keep it simple and recognizable
   - Ensure it's readable at small sizes

2. **Banner:**
   - Use high-quality images (at least 1200px wide)
   - Optimize file size for web (use tools like TinyPNG)
   - Ensure important content is in the center (safe zone)
   - Consider mobile responsiveness

## 🔧 Troubleshooting

### Images not showing?

1. **Check file names:** Must be exactly `logo.png` and `banner.jpg` (or `.png`)
2. **Check file location:** Must be in `frontend/public/` folder
3. **Check file format:** Supported formats are PNG, JPG, JPEG
4. **Clear browser cache:** Hard refresh (Ctrl+F5 or Cmd+Shift+R)
5. **Check console:** Look for 404 errors in browser console

### Upload not working?

1. Check Cloudinary configuration in the code
2. Verify upload preset is set correctly
3. Check browser console for errors
4. Ensure file size is within limits

## 📝 Notes

- Images uploaded via UI are stored in Cloudinary and localStorage
- Local images in `/public` folder take precedence
- If images are not found, the default design (text logo + illustration) will be shown
- Uploaded images persist across page refreshes via localStorage

