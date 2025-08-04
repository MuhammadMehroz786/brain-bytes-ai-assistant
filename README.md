# Brain Bytes AI Assistant

A modern React application with Gmail OAuth integration and AI-powered features.

## Features

- 📧 Gmail OAuth integration for email management
- 🗓️ Google Calendar integration
- 🤖 OpenAI-powered AI features
- 🎯 Focus timer and productivity tools
- 📊 Dashboard with analytics
- 🔐 Secure authentication and data handling

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google OAuth credentials
- OpenAI API key (optional)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.oauth
   ```

4. Edit `.env.oauth` with your credentials:
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)

5. Start development servers:
   ```bash
   npm run dev
   ```

This will start:
- Frontend development server on `http://localhost:8081`
- OAuth server on `http://localhost:8082`

## Production Deployment

### Environment Setup

1. Create production environment file:
   ```bash
   cp .env.example .env.production
   ```

2. Update `.env.production` with production values:
   - Set `NODE_ENV=production`
   - Update `REDIRECT_URI` to your production domain
   - Set `ALLOWED_ORIGINS` to your production domains
   - Add all required API keys

### Manual Deployment

1. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

### Docker Deployment

1. Build and run with Docker Compose:
   ```bash
   docker-compose up --build -d
   ```

2. Or build manually:
   ```bash
   docker build -t brain-bytes-ai .
   docker run -p 8081:8081 -p 8082:8082 --env-file .env.production brain-bytes-ai
   ```

## Architecture

### Frontend (Port 8081)
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- React Router for navigation
- TanStack Query for state management

### OAuth Server (Port 8082)
- Express.js server
- Google OAuth 2.0 flow
- Gmail and Calendar API integration
- OpenAI integration for AI features

## Security Features

- Environment-based configuration
- CORS protection
- Security headers (HSTS, XSS protection, etc.)
- Input validation and sanitization
- Secure token storage

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `REDIRECT_URI` | OAuth callback URL | Yes |
| `OPENAI_API_KEY` | OpenAI API key | No |
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | OAuth server port | No (default: 8082) |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | Production only |

## Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm start` - Start production servers
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## Troubleshooting

### OAuth Issues
- Ensure Google OAuth credentials are correct
- Check that redirect URI matches in Google Console
- Verify CORS settings for production

### Build Issues
- Run `npm run lint:fix` to fix linting issues
- Check TypeScript errors with `npm run typecheck`
- Ensure all environment variables are set

## Lovable Integration

This project was created with [Lovable](https://lovable.dev/projects/3b265984-f5ce-4bed-b94d-42e8cebb19cf).

### Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Express.js
- Google APIs
- OpenAI API

## License

Private project - All rights reserved.
