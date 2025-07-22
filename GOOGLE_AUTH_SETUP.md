# Google OAuth Setup Guide

## Quick Setup

Your app is now configured for Google OAuth authentication! Follow these steps to complete the setup:

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or Google People API)
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Select **Web application**
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

## 2. Create Environment Variables

Create a `.env.local` file in your project root with these variables:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Your Google Workspace domain (e.g., "yourcompany.com")
# Users must have email addresses ending with @yourcompany.com to sign in
# Leave empty to allow any Google account
GOOGLE_WORKSPACE_DOMAIN=yourcompany.com

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
# Generate a random secret: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## 3. Generate NextAuth Secret

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## 4. Restart the Development Server

After creating the `.env.local` file, restart your development server:
```bash
npm run dev
```

## Features Implemented

✅ **Google OAuth Integration**: Users can sign in with their Google Work accounts  
✅ **Domain Restriction**: Only users from your specified Google Workspace domain can sign in  
✅ **Session Management**: User sessions are managed automatically  
✅ **User Interface**: Login/Signup buttons route to Google authentication  
✅ **User Avatar**: Displays user's Google profile picture and info  
✅ **Secure Logout**: Users can securely sign out  

## How It Works

- **Login/Signup buttons** now route to Google OAuth instead of placeholder actions
- **Domain restriction** ensures only your company's Google Workspace users can access
- **Session persistence** keeps users logged in across browser sessions
- **User dropdown** shows user info and logout option when authenticated

## Troubleshooting

- Make sure your Google OAuth redirect URI matches exactly: `http://localhost:3000/api/auth/callback/google`
- Ensure your Google Workspace domain is correct in the environment variables
- Check that all environment variables are properly set in `.env.local` 