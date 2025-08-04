# Deployment Guide for Brain Bytes AI Assistant

## 🚀 Publishing via Lovable

This project is configured to be published through Lovable. Follow these steps:

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Lovable deployment"
git push origin main
```

### 2. Configure Environment Variables in Lovable
When publishing through Lovable, you'll need to set these environment variables:

**Required:**
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret

**Optional:**
- `OPENAI_API_KEY` - For AI features
- `VITE_SUPABASE_URL` - If using Supabase
- `VITE_SUPABASE_ANON_KEY` - If using Supabase

### 3. OAuth Server Considerations

⚠️ **Important**: The OAuth server (`gmail-oauth-server.mjs`) needs special handling for Lovable deployment:

**Option A: Use Lovable's Backend Features**
- Deploy the OAuth server as a backend service through Lovable
- Update the `REDIRECT_URI` environment variable to match your published domain

**Option B: External OAuth Service**
- Deploy the OAuth server separately (Vercel, Railway, etc.)
- Update your frontend to point to the external OAuth service

### 4. Domain Configuration

After publishing:
1. Note your Lovable-provided domain (e.g., `https://your-app.lovable.app`)
2. Update Google OAuth settings:
   - Add your domain to authorized origins
   - Update redirect URI to `https://your-app.lovable.app:8082/callback` (or your OAuth server domain)

### 5. Publishing Steps in Lovable

1. Go to your Lovable project dashboard
2. Click "Share" → "Publish"
3. Configure environment variables
4. Choose deployment settings
5. Deploy!

## 🔧 Technical Notes

- **Frontend**: Builds as a static React app (`npm run build`)
- **OAuth Server**: Requires Node.js runtime (consider serverless deployment)
- **Database**: Currently uses in-memory storage (upgrade for production)

## 🔒 Security Checklist

- ✅ Environment variables secured
- ✅ CORS properly configured
- ✅ Security headers implemented
- ✅ No hardcoded secrets in code
- ✅ OAuth redirect URIs match deployment domain

## 🐛 Troubleshooting

**OAuth not working after deployment:**
1. Check that redirect URI matches in Google Console
2. Verify environment variables are set correctly
3. Ensure OAuth server is accessible

**Build failures:**
1. Run `npm run lint:fix` to fix linting issues
2. Check TypeScript errors with `npm run typecheck`
3. Verify all dependencies are in `package.json`

## 📞 Support

If you encounter issues during Lovable deployment, check:
- [Lovable Documentation](https://docs.lovable.dev)
- Project logs in Lovable dashboard
- GitHub Actions (if enabled)