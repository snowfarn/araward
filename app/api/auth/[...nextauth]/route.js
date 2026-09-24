import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { readJSON, writeJSON } from "@/lib/data";

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
    async signIn({ user, account, profile }) {
      console.log('[signIn] Provider:', account?.provider, 'User ID:', user?.id, 'Profile ID:', profile?.id);
      if (account?.provider === 'discord' && (profile?.id || user?.id)) {
        try {
          const discordId = profile?.id || user?.id;
          const members = readJSON('members.json') || [];
          const isMember = members.some(m => m.id === discordId);
          console.log('[signIn] Discord ID:', discordId, 'Is already member:', isMember, 'Total members:', members.length);
          
          if (!isMember) {
            const apps = readJSON('applications.json') || [];
            console.log('[signIn] Current applications count:', apps.length);
            
            let avatarUrl = user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png';
            if (profile?.avatar) {
              const ext = profile.avatar.startsWith('a_') ? 'gif' : 'png';
              avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${profile.avatar}.${ext}?size=256`;
            }
            const displayName = profile?.global_name || profile?.username || user?.name || 'Discord User';
            const username = profile?.username || user?.name || '';

            const existingIdx = apps.findIndex(a => a.id === discordId);
            if (existingIdx !== -1) {
              apps[existingIdx] = {
                ...apps[existingIdx],
                name: displayName,
                username,
                avatar: avatarUrl,
                updatedAt: new Date().toISOString()
              };
              console.log('[signIn] Updated existing application for:', displayName);
            } else {
              apps.push({
                id: discordId,
                name: displayName,
                username,
                avatar: avatarUrl,
                appliedAt: new Date().toISOString()
              });
              console.log('[signIn] Created new application for:', displayName);
            }
            const writeResult = writeJSON('applications.json', apps);
            console.log('[signIn] Write applications result:', writeResult, 'New count:', apps.length);
          }
        } catch (e) {
          console.error('[signIn] ERROR recording application:', e);
        }
      }
      return true;
    },
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
