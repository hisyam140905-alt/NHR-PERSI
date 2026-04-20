// setup-admin.ts
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

// Connect to Turso
const db = createClient({
    url: process.env.TURSO_DATABASE_URL as string,
    authToken: process.env.TURSO_AUTH_TOKEN as string,
});

async function createMasterAdmin() {
    console.log("Generating Master Admin...");

    const username = "admin@persi"; // You can change this
    const plainPassword = "admin123!"; // CHANGE THIS!

    try {
        // 1. Scramble (Hash) the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

        // 2. Inject into Turso
        await db.execute({
            sql: "INSERT INTO admins (id, username, password_hash, role) VALUES (?, ?, ?, ?)",
            args: ["admin-002", username, passwordHash, "superadmin"]
        });

        console.log("✅ Master Admin created successfully!");
        console.log(`Username: ${username}`);
        console.log("You can now safely delete this setup-admin.ts file.");

    } catch (error) {
        console.error("❌ Error creating admin:", error);
    }
}

createMasterAdmin();