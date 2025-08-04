#!/usr/bin/env node

/**
 * Setup script for OAuth server deployment
 * This script ensures the OAuth server is properly configured for different environments
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔧 Setting up OAuth server for deployment...');

// Check if we're in a Lovable environment
const isLovableEnvironment = process.env.LOVABLE_ENV === 'true' || process.env.VERCEL_ENV;

if (isLovableEnvironment) {
  console.log('📱 Lovable environment detected - OAuth server will be deployed separately');
  
  // Create a serverless function version for OAuth endpoints
  const serverlessDir = path.join(projectRoot, 'api');
  if (!fs.existsSync(serverlessDir)) {
    fs.mkdirSync(serverlessDir, { recursive: true });
  }
  
  // Create basic OAuth endpoints as serverless functions
  const oauthHandler = `
export default function handler(req, res) {
  // Basic OAuth handler for Lovable deployment
  // This is a placeholder - OAuth functionality should be implemented
  // through your hosting provider's serverless functions
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.url === '/api/auth/google') {
    return res.status(200).json({ 
      message: 'OAuth server endpoint - configure with your hosting provider',
      environment: 'lovable'
    });
  }
  
  res.status(404).json({ error: 'Endpoint not found' });
}
`;
  
  fs.writeFileSync(path.join(serverlessDir, 'oauth.js'), oauthHandler);
  console.log('✅ Created serverless OAuth handler');
  
} else {
  console.log('🖥️  Standard deployment - OAuth server will run alongside frontend');
}

console.log('✅ OAuth server setup completed');