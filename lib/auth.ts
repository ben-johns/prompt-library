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
        console.log("Sign-in attempt:", user.email, user.name);
        
        // TODO: Update domain restriction or remove for testing
        // const domain = "braze.com";
        // if (user?.email && !user.email.endsWith(`@${domain}`)) {
        //   console.log("Domain rejected:", user.email);
        //   return false; // Reject sign-in if not from braze.com domain
        // }

        // Create or update user in database
        if (user.email && user.name) {
          try {
            console.log("Creating user:", user.email, user.name);
            // Use email as the stable ID for consistency
            const userId = user.email;
            const result = await userOperations.upsert({
              id: userId,
              email: user.email,
              name: user.name,
              image: user.image || undefined,
            });
            console.log("User created successfully:", result);
          } catch (error) {
            console.error("Error creating/updating user:", error);
            return false;
          }
        } else {
          console.log("Missing email or name:", { email: user.email, name: user.name });
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