'use server'
import { signIn } from "@/auth"
import { AuthError } from "next-auth";

export async function ceredntialLogin(formData){
    try {
        await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false
        })
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            if (error.type === "CredentialsSignin") {
                return {
                    success: false,
                    error: "Invalid email or password.",
                };
            }

            return {
                success: false,
                error: "Unable to sign in. Please try again.",
            };
        }

        throw error;
    }
}
