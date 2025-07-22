import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { userOperations } from "./database"
import "./types" // Import type extensions

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "628668809986-ksdtp7elq49igfh7vrba2l4f0lq9h19t.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "u7eB2KQenrAf1ifj3vIYVGd9qrp",
      authorization: {
        params: {
          hd: "braze.com", // Restrict to Braze Google Workspace domain
          prompt: "select_account",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "N9SSZTv4bv/OR9KajVJr1tA2BSdYRs2+e6nreHnTNV0=",
  callbacks: {
    async signIn({ user, account }) {
      // Only allow users from Braze Google Workspace domain
      if (account?.provider === "google") {
        const domain = "braze.com";
        if (user?.email && !user.email.endsWith(`@${domain}`)) {
          return false; // Reject sign-in if not from braze.com domain
        }

        // Create or update user in database
        if (user.email && user.name) {
          try {
            // Use email as the stable ID for consistency
            const userId = user.email;
            await userOperations.upsert({
              id: userId,
              email: user.email,
              name: user.name,
              image: user.image || undefined,
            });
          } catch (error) {
            console.error("Error creating/updating user:", error);
            return false;
          }
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Add user ID to session
      if (session.user?.email) {
        const dbUser = await userOperations.findByEmail(session.user.email);
        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add user ID to token
      if (user?.email) {
        // Use email as the stable ID
        token.userId = user.email;
      }
      return token;
    },
  },
}

export default NextAuth(authOptions)
export { authOptions } 