/*
 * Google OAuth Setup:
 * 1. Go to https://console.cloud.google.com
 * 2. Create new project or select existing
 * 3. Enable Google+ API
 * 4. Create OAuth 2.0 Client ID (Web application)
 * 5. Add authorized redirect URIs:
 *    - http://localhost:3000/api/auth/callback/google
 *    - https://yourdomain.com/api/auth/callback/google (production)
 * 6. Copy Client ID and Client Secret
 * 7. Add to .env.local:
 *    GOOGLE_CLIENT_ID=your-client-id
 *    GOOGLE_CLIENT_SECRET=your-client-secret
 *    NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
 *    NEXTAUTH_URL=http://localhost:3000
 *
 * ADMIN_EMAILS Configuration:
 * - Add admin emails to .env.local
 * - Format: ADMIN_EMAILS=email1@domain.com,email2@domain.com
 * - No spaces between emails
 * - If not set, first user becomes admin automatically (fallback)
 * - Existing users must logout and login again after being added to the list
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
