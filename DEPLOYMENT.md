# Deployment Guide for Sokoni Connect

## Frontend Deployment (Netlify)

### Option 1: Netlify Dashboard (Recommended)
1. **Build the project locally:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Drag and drop your `build` folder to the deploy area
   - Or connect your GitHub repository for automatic deployments

3. **Set Environment Variables in Netlify:**
   - Go to Site settings > Environment variables
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.herokuapp.com/api`

### Option 2: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=build
```

## Backend Deployment (Heroku)

### Step 1: Prepare Backend for Heroku
1. **Create a separate Heroku app for the backend:**
   ```bash
   # Install Heroku CLI first
   heroku create sokoni-connect-api
   ```

2. **Set up the backend as a separate deployable unit:**
   - The backend already has its own `package.json`
   - Heroku will use the `Procfile` to start the server

### Step 2: Deploy to Heroku
```bash
# From your project root
git add .
git commit -m "Prepare for deployment"

# Deploy to Heroku
git push heroku main
```

### Step 3: Set Environment Variables on Heroku
```bash
heroku config:set JWT_SECRET=your-production-jwt-secret
heroku config:set NODE_ENV=production
heroku config:set PORT=5000

# M-Pesa credentials (when you have them)
heroku config:set MPESA_CONSUMER_KEY=your-key
heroku config:set MPESA_CONSUMER_SECRET=your-secret
heroku config:set MPESA_PASSKEY=your-passkey
heroku config:set MPESA_SHORTCODE=your-shortcode
```

## Alternative Backend Deployment Options

### Railway
1. Connect your GitHub repository to Railway
2. Select the backend folder
3. Railway will auto-detect and deploy

### Render
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`

## Complete Deployment Checklist

### Before Deployment:
- ✅ Update API URLs to use environment variables
- ✅ Create production environment files
- ✅ Test locally with production-like settings
- ✅ Ensure all dependencies are listed correctly

### Backend Deployment:
1. Deploy backend to Heroku/Railway/Render
2. Note the deployed backend URL
3. Test API endpoints (e.g., `https://your-backend.herokuapp.com/api/auth/ping`)

### Frontend Deployment:
1. Update `REACT_APP_API_URL` to point to your deployed backend
2. Build and deploy to Netlify
3. Test the full application flow

### Post-Deployment Testing:
1. Test user registration and login
2. Test M-Pesa payment flow
3. Test all major features
4. Check browser console for any errors

## Environment Variables Summary

### Frontend (.env.production or Netlify settings):
```
REACT_APP_API_URL=https://your-backend-url.herokuapp.com/api
```

### Backend (Heroku config vars):
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-production-secret
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_PASSKEY=your-passkey
MPESA_SHORTCODE=your-shortcode
```

## Troubleshooting Common Issues

### "Cannot fetch" errors:
- Check that REACT_APP_API_URL is correctly set
- Verify backend is deployed and accessible
- Check CORS settings in backend

### Database issues:
- SQLite works for development but consider PostgreSQL for production
- Heroku provides free PostgreSQL add-ons

### M-Pesa integration:
- Ensure all M-Pesa credentials are set correctly
- Test with sandbox credentials first
- Check Safaricom API documentation for production setup
