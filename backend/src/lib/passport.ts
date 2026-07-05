import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './prisma';
import { generateToken } from './auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      let user = await prisma.user.findFirst({
        where: { OR: [{ googleId: profile.id }, { email: profile.emails?.[0]?.value || '' }] },
      });

      if (user) {
        if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId: profile.id, googleAvatar: profile.photos?.[0]?.value || null },
          });
        }
      } else {
        const email = profile.emails?.[0]?.value || `${profile.id}@google-oauth.local`;
        const nameParts = (profile.displayName || 'Usuario Google').split(' ');
        const firstName = nameParts[0] || 'Usuario';
        const lastName = nameParts.slice(1).join(' ') || 'Google';

        user = await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            password: '',
            googleId: profile.id,
            googleAvatar: profile.photos?.[0]?.value || null,
            role: 'USER',
            status: 'activo',
          },
        });
      }

      const token = generateToken({ userId: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName });
      done(null, { user, token } as any);
    } catch (err) {
      done(err as Error);
    }
  }));
} else {
  console.warn('[Google OAuth] GOOGLE_CLIENT_ID y/o GOOGLE_CLIENT_SECRET no configurados. Login con Google deshabilitado.');
}

passport.serializeUser((data: any, done) => {
  done(null, { user: data.user, token: data.token });
});

passport.deserializeUser((data: any, done) => {
  done(null, data);
});

// This is needed because Passport's User type doesn't match our serialized data
export {};

export default passport;
