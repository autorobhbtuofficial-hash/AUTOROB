# Cloudinary Setup Instructions

## Issue: Images Not Uploading

The image upload requires a Cloudinary **Upload Preset** to be configured.

## Steps to Fix:

### 1. Go to Cloudinary Dashboard
- Visit: https://cloudinary.com/console
- Login with your account

### 2. Create an Upload Preset
1. Go to **Settings** (gear icon in top right)
2. Click on **Upload** tab
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Configure:
   - **Preset name**: `autorob_uploads` (or any name you prefer)
   - **Signing Mode**: **Unsigned** (important!)
   - **Folder**: `autorob` (optional, for organization)
   - Click **Save**

### 3. Update .env File
The `.env` file has been updated with:
```
VITE_CLOUDINARY_UPLOAD_PRESET=autorob_uploads
```

**If you used a different preset name**, update this value in `.env`

### 4. Restart Development Server
**IMPORTANT**: You MUST restart the dev server for .env changes to take effect!

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm run dev
```

## Verification

After restarting:
1. Go to Admin Panel → Team Management
2. Try adding a team member with a photo
3. Check browser console (F12) for upload logs
4. You should see:
   - "Starting Cloudinary upload..."
   - "Upload successful! URL: ..."

## Troubleshooting

### Error: "Upload preset is not configured"
- Make sure you added `VITE_CLOUDINARY_UPLOAD_PRESET` to `.env`
- Restart the dev server

### Error: "Upload preset not found"
- The preset name in `.env` doesn't match Cloudinary
- Check the exact name in Cloudinary dashboard
- Update `.env` with correct name

### Error: "Invalid signature"
- Make sure the upload preset is set to **Unsigned**
- Go to Cloudinary → Settings → Upload → Edit preset → Set to Unsigned

### Images still not showing
- Check browser console for errors
- Verify the Cloudinary cloud name is correct
- Make sure the upload preset exists and is unsigned

## Current Configuration

Your Cloudinary settings:
- **Cloud Name**: `dgm2mvpwf`
- **Upload Preset**: `autorob_uploads` (needs to be created)

The upload preset MUST be created in your Cloudinary dashboard!
