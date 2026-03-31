import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        return {
          id: "demo-user",
          name: "Familia MINIFIMY",
          email: credentials.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/cuenta",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
