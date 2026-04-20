import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const db = createClient({
    url: process.env.TURSO_DATABASE_URL as string,
    authToken: process.env.TURSO_AUTH_TOKEN as string,
});

async function forceResetPassword() {
    console.log("Generating new hash for 'admin123'...");

    // 1. Scramble the exact password you want to use
    const newHash = await bcrypt.hash("admin123", 10);

    try {
        // 2. Force Turso to update this specific user
        const result = await db.execute({
            sql: "UPDATE admins SET password_hash = ? WHERE username = ?",
            args: [newHash, "admin@persi"]
        });

        if (result.rowsAffected > 0) {
            console.log("✅ SUCCESS! Password for admin@persi is now exactly 'admin123'");
        } else {
            console.log("❌ Failed: Could not find user admin@persi in the database.");
        }
    } catch (error) {
        console.error("Database error:", error);
    }
}

forceResetPassword();