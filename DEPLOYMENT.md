# TempoSketch Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is made by the creators of Next.js and offers the best integration.

**Steps:**

1. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: TempoSketch complete"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New Project"
   - Import your TempoSketch repository
   - Click "Deploy" (Vercel auto-detects Next.js settings)
   - Done! Your app will be live at `https://your-project.vercel.app`

**Build Settings (Auto-configured):**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Option 2: Netlify

**Steps:**

1. **Push to GitHub** (as above)

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your TempoSketch repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Click "Deploy"

### Option 3: GitHub Pages (Static Export)

For GitHub Pages, you need to export Next.js as a static site.

1. **Update `next.config.js`:**
   ```js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   }
   
   module.exports = nextConfig
   ```

2. **Build static export:**
   ```bash
   npm run build
   ```

3. **Deploy `out` folder to GitHub Pages**

⚠️ **Note:** Static export may have limitations with dynamic features.

### Option 4: Self-Hosting (VPS/Cloud)

**Requirements:**
- Node.js 18 or 20
- npm or yarn

**Steps:**

1. **Build production bundle:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "temposketch" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure nginx reverse proxy** (optional):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔧 Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] Environment variables configured (if any)
- [ ] `.gitignore` includes `node_modules`, `.next`, `.env*`
- [ ] `package.json` has correct `engines` field
- [ ] README updated with live demo URL

## 📊 Post-Deployment Steps

1. **Test the deployed app:**
   - Visit your live URL
   - Try all demo curves
   - Test audio playback
   - Verify MIDI export works
   - Check mobile responsiveness

2. **Monitor performance:**
   - Check Vercel Analytics (if using Vercel)
   - Monitor Core Web Vitals
   - Check for any console errors

3. **Update README:**
   - Add live demo link
   - Add deployment badge
   - Update screenshots

## 🌐 Custom Domain

### Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS settings

## 🔒 Environment Variables

If you add any environment variables in the future:

**Vercel:**
- Settings → Environment Variables
- Add variables for Production, Preview, Development

**Netlify:**
- Site Settings → Environment Variables
- Add key-value pairs

## 📈 Performance Optimization

Already included in this build:
- ✅ Next.js automatic code splitting
- ✅ Image optimization (Next.js built-in)
- ✅ CSS optimization (Tailwind purge)
- ✅ TypeScript compilation
- ✅ Minification and compression

## 🐛 Troubleshooting

**Build fails:**
- Check Node.js version matches `.nvmrc` (20)
- Run `npm install` to ensure all dependencies installed
- Check build logs for specific errors

**Audio not working:**
- Browser autoplay policies require user interaction
- Ensure HTTPS (required for some Web Audio features)
- Check browser console for errors

**MIDI export not working:**
- Check browser compatibility
- Verify `@tonejs/midi` is installed
- Check for popup blockers blocking downloads

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)

---

**Recommended: Use Vercel for the best Next.js deployment experience!** 🚀
