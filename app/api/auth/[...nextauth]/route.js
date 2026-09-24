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
      if (account?.provider === 'discord' && (profile?.id || user?.id)) {
        try {
          const discordId = profile?.id || user?.id;
          const members = (await readJSON('members.json')) || [];
          const isMember = members.some(m => m.id === discordId);
          
          // Skip entirely if already a member
          if (isMember) {
            console.log('[signIn] Already a member, skipping:', discordId);
            return true;
          }

          const apps = (await readJSON('applications.json')) || [];
          
          let avatarUrl = user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png';
          if (profile?.avatar) {
            const ext = profile.avatar.startsWith('a_') ? 'gif' : 'png';
            avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${profile.avatar}.${ext}?size=256`;
          }
          const displayName = profile?.global_name || profile?.username || user?.name || 'Discord User';
          const username = profile?.username || user?.name || '';

          const existingIdx = apps.findIndex(a => a.id === discordId);
          if (existingIdx !== -1) {
            // Already has application — update info only
            apps[existingIdx] = {
              ...apps[existingIdx],
              name: displayName,
              username,
              avatar: avatarUrl,
              updatedAt: new Date().toISOString()
            };
          } else {
            // Brand new application
            apps.push({
              id: discordId,
              name: displayName,
              username,
              avatar: avatarUrl,
              appliedAt: new Date().toISOString()
            });
          }
          await writeJSON('applications.json', apps);
        } catch (e) {
          console.error('[signIn] ERROR:', e);
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
