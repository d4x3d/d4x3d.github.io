import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    GitHub({
      profile(githubProfile: any) {
        return {
          id: String(githubProfile.id),
          name: githubProfile.login, // use GitHub login as user.name for admin checks
          displayName: githubProfile.name ?? githubProfile.login,
          githubId: String(githubProfile.id),
          email: githubProfile.email,
          image: githubProfile.avatar_url,
        };
      },
    }),
  ],
});
