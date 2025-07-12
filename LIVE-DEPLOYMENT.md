# 🚀 Sokoni Connect - Live Deployment Guide

## 🎯 Quick Deployment Steps

### Step 1: Deploy Backend to Railway (Easiest Option)

1. **Go to Railway**: https://railway.app
2. **Sign in** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select** your `SokoniConnect` repository
5. **Choose** the backend folder
6. **Add Environment Variables**:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-2024
   PORT=5000
   ```
7. **Deploy** - Railway will give you a URL like: `https://sokoni-connect-backend.railway.app`

### Step 2: Deploy Frontend to Netlify

1. **Go to Netlify**: https://netlify.com
2. **Sign in** with GitHub
3. **New site from Git** → Select your repository
4. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `build`
5. **Environment Variables** (Site settings → Environment variables):
   ```
   REACT_APP_API_URL=https://your-railway-backend-url.railway.app/api
   ```
6. **Deploy** - You'll get a URL like: `https://sokoni-connect.netlify.app`

### Step 3: Test Your Live Application

1. **Visit your Netlify URL**
2. **Test login** with: `demo` / `password`
3. **Test M-Pesa payments** (will use your Railway backend)

## 🔧 Alternative: Manual Deployment

### Option A: Heroku (Backend) + Netlify (Frontend)

#### Deploy Backend to Heroku:
```bash
# Install Heroku CLI first
heroku create sokoni-connect-api
git add .
git commit -m "Deploy to production"
git push heroku main

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production
```

#### Deploy Frontend to Netlify:
1. Upload your `build` folder to netlify.com
2. Set environment variable: `REACT_APP_API_URL=https://sokoni-connect-api.herokuapp.com/api`

### Option B: Vercel (Both Frontend + Backend)

1. **Go to Vercel**: https://vercel.com
2. **Import** your GitHub repository
3. **Framework preset**: Create React App
4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-project.vercel.app/api
   ```

## 🌟 Recommended Deployment (Easiest)

### Railway + Netlify Combo (5 minutes setup):

1. **Railway for Backend** (Free tier available)
   - Automatic deployments from GitHub
   - Built-in PostgreSQL if needed
   - Environment variables easy to set

2. **Netlify for Frontend** (Free tier generous)
   - Automatic deployments from GitHub
   - Custom domain support
   - CDN included

## 🔗 Your Live URLs Will Be:

- **Frontend**: `https://sokoni-connect.netlify.app`
- **Backend**: `https://sokoni-connect-backend.railway.app`
- **GitHub**: `https://github.com/KimutaiAsbel/SokoniConnect`

## 🎉 After Deployment:

Your live application will have:
- ✅ Real-time M-Pesa integration
- ✅ Multi-user authentication
- ✅ Market intelligence for Nandi County
- ✅ Cross-device accessibility
- ✅ Professional domain (optional)

## 🆘 Need Help?

If you encounter any issues:
1. Check the deployment logs
2. Verify environment variables are set
3. Test API endpoints manually
4. Check CORS settings if needed

**Ready to go live in under 10 minutes!** 🚀
