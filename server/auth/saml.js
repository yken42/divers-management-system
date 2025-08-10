import passport from "passport";
import { Strategy as SamlStrategy } from "passport-saml";
import "dotenv/config";

// Configure SAML strategy from environment variables
const samlStrategy = new SamlStrategy(
  {
    entryPoint: process.env.SAML_ENTRY_POINT, // IdP SSO URL
    issuer: process.env.SAML_ISSUER || "divers-management-system-sp",
    callbackUrl:
      process.env.SAML_CALLBACK_URL || "http://localhost:4000/auth/saml/callback",
    cert: process.env.SAML_IDP_CERT, // IdP signing certificate (PEM)
    identifierFormat: null,
    disableRequestedAuthnContext: true,
    signatureAlgorithm: process.env.SAML_SIGNATURE_ALGORITHM || "sha256",
    acceptedClockSkewMs: 5 * 60 * 1000,
    passReqToCallback: false,
  },
  (profile, done) => {
    // The SAML profile comes from the IdP
    // Defer DB lookups to the route handler after authenticate
    return done(null, profile);
  }
);

passport.use("saml", samlStrategy);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
export { samlStrategy };


