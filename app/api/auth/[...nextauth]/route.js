import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      authorization: {
        params: {
          // Request identify & guilds scopes as requested by user
          scope: 'identify guilds'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.id = profile.id;
        token.username = profile.username;
        token.global_name = profile.global_name;
        token.discriminator = profile.discriminator;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub || token.id;
        session.user.username = token.username;
        session.user.global_name = token.global_name;
        session.accessToken = token.accessToken;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 3600, // 1 hour
  },
  jwt: {
    maxAge: 3600, // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-gang-key-12345",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
