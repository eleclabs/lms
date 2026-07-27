import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "./model/user-model";
import bcrypt from 'bcryptjs';
import { authConfig } from "./auth.config";
import { dbConnect } from "./service/mongo";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            async authorize(credentials) {
                const email = credentials?.email?.toString().trim().toLowerCase();
                const password = credentials?.password?.toString();

                if (!email || !password) {
                    return null;
                }

                await dbConnect();
                const user = await User.findOne({ email });

                if (!user) {
                    return null;
                }

                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    return null;
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    role: user.role,
                };
            }
        })

    ]
})
