import { Hono } from "hono";
import type { Context } from "hono";

declare const Deno: {
  env: { get: (key: string) => string | undefined };
  serve: (handler: any) => void;
};

import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createClient } from "@libsql/client/web";
import { jwt, sign } from "hono/jwt";
import * as bcrypt from "bcryptjs";

// ============ DATABASE TYPES ============
type HospitalAccountRow = {
  email: string;
  password: string;
  hospital_name: string;
  pic_name: string;
  province: string;
  city: string;
  status: string;
};

type SurveyRow = {
  id: string;
  patient_name: string;
  patient_rm: string;
  prem_score: number;
  prom_score: number;
  overall_score: number;
  answers: string | null;
  created_at: string;
};

type PatientRow = {
  id: string;
  hospitalCode: string;
  specialty: string;
  patientName: string;
  mrn: string;
  registeredAt: string;
};

type DraftRow = {
  data: string;
};

type SurveyInput = {
  patientName?: string;
  qName?: string;
  medicalRecordNumber?: string;
  qRm?: string;
  premScore?: number;
  promScore?: number;
  overallScore?: number;
  answers?: Record<string, unknown>;
};

type SubmissionRow = {
  id: string;
  hospital_name: string;
  specialty: string;
  pic_name: string;
  submitted_date: string;
  status: string;
  scores: string;
  details: string | null;
};

type RankingRow = {
  id: string;
  hospital_name: string;
  city: string;
  province: string;
  specialty: string;
  final_score: number;
  rsbk_score: number;
  clinical_audit_score: number;
  patient_report_score: number;
  grade: string;
  approved_at: string;
  submission_id: string;
};

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Turso Client securely on the server
const db = createClient({
  url: Deno.env.get("TURSO_DATABASE_URL") || "",
  authToken: Deno.env.get("TURSO_AUTH_TOKEN") || "",
});

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "super-secret-fallback-key-change-me";

// ============ DATABASE INITIALIZATION ============
// Runs once on startup — creates all tables if they don't exist yet
async function initDb() {
  const statements = [
    // Hospitals (used for registration & login)
    `CREATE TABLE IF NOT EXISTS hospitals (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      hospital_name TEXT NOT NULL,
      pic_name TEXT DEFAULT '',
      province TEXT DEFAULT '',
      city TEXT DEFAULT '',
      surat_tugas_filename TEXT DEFAULT '',
      surat_tugas_data TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    // Admins
    `CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    // Registered patients (for QR code generation)
    `CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      hospital_code TEXT NOT NULL,
      specialty TEXT NOT NULL,
      name TEXT NOT NULL,
      rm TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    // Patient survey responses (PREM/PROM)
    `CREATE TABLE IF NOT EXISTS surveys (
      id TEXT PRIMARY KEY,
      hospital_code TEXT NOT NULL,
      specialty TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      patient_rm TEXT NOT NULL,
      prem_score REAL DEFAULT 0,
      prom_score REAL DEFAULT 0,
      overall_score REAL DEFAULT 0,
      answers TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    // Drafts (clinical audit, patient report, hospital assessment)
    `CREATE TABLE IF NOT EXISTS drafts (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      hospital_code TEXT NOT NULL,
      specialty TEXT NOT NULL,
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    // Submissions
    `CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      hospitalName TEXT NOT NULL,
      specialty TEXT DEFAULT '-',
      status TEXT DEFAULT 'pending',
      rsbkScore REAL DEFAULT 0,
      auditScore REAL DEFAULT 0,
      prmScore REAL DEFAULT 0,
      final_score REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      data TEXT DEFAULT '{}'
    )`,
    // Rankings
    `CREATE TABLE IF NOT EXISTS rankings (
      id TEXT PRIMARY KEY,
      submission_id TEXT NOT NULL,
      hospital_name TEXT NOT NULL,
      city TEXT DEFAULT '',
      province TEXT DEFAULT '',
      specialty TEXT NOT NULL,
      final_score REAL DEFAULT 0,
      rsbk_score REAL DEFAULT 0,
      clinical_audit_score REAL DEFAULT 0,
      patient_report_score REAL DEFAULT 0,
      grade TEXT DEFAULT 'C',
      approved_at TEXT DEFAULT (datetime('now'))
    )`,
  ];

  for (const sql of statements) {
    try {
      await db.execute(sql);
    } catch (err) {
      console.error("DB init error for statement:", err);
    }
  }
  console.log("✅ Database tables initialized.");
}

// Run initialization immediately
initDb().catch(console.error);

// ============ PUBLIC ROUTES (No Token Required) ============

app.get("/make-server-5e1d66c4/health", (c: Context) => {
  return c.json({ status: "ok" });
});


// HOSPITAL REGISTRATION
app.post("/make-server-5e1d66c4/hospital/register", async (c: Context) => {
  try {
    // 1. Get ALL the data from the frontend form
    const body = await c.req.json();
    console.log("➡️ REGISTRATION DATA RECEIVED FOR:", body.email);

    // Destructure all 8 fields sent by React
    const {
      email,
      password,
      hospitalName,
      picName,
      province,
      city,
      suratTugasFileName,
      suratTugasData
    } = body;

    // Safety Check
    if (!email || !password || !hospitalName) {
      console.log("❌ Missing core required fields");
      return c.json({ error: "Missing required fields" }, 400);
    }

    // 2. Check if the hospital email is already registered
    const checkExisting = await db.execute({
      sql: "SELECT * FROM hospitals WHERE email = ?",
      args: [email.toLowerCase()]
    });

    if (checkExisting.rows.length > 0) {
      console.log("❌ Registration failed: Email already exists");
      return c.json({ error: "Email sudah terdaftar" }, 409);
    }

    // 3. Scramble the password!
    console.log("➡️ Scrambling password...");
    const passwordHash = await bcrypt.hash(password, 10);

    // Create a unique random ID for the new hospital
    const hospitalId = `hosp-${Date.now()}`;

    // 4. Save everything to Turso
    console.log("➡️ Injecting into database...");
    await db.execute({
      sql: `INSERT INTO hospitals (
              id, email, password_hash, hospital_name, 
              pic_name, province, city, 
              surat_tugas_filename, surat_tugas_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        hospitalId,
        email.toLowerCase(),
        passwordHash,
        hospitalName,
        picName || "",
        province || "",
        city || "",
        suratTugasFileName || "",
        suratTugasData || ""
      ]
    });

    console.log(`✅ HOSPITAL REGISTERED SUCCESSFULLY: ${hospitalName}`);

    // 5. Success response
    return c.json({
      success: true,
      message: "Registrasi berhasil",
      hospitalId: hospitalId
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("🔥 FATAL REGISTRATION ERROR:", errorMessage);
    return c.json({ error: "Gagal melakukan registrasi" }, 500);
  }
});

// --- GET ALL HOSPITALS (For Admin Dashboard) ---
app.get("/make-server-5e1d66c4/admin/hospitals", async (c: Context) => {
  try {
    // Fetch all hospitals, ordering by newest first
    const result = await db.execute(`
      SELECT id, email, hospital_name, pic_name, province, city, status, surat_tugas_filename, surat_tugas_data, created_at 
      FROM hospitals 
      ORDER BY created_at DESC
    `);

    return c.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Failed to fetch hospitals:", err);
    return c.json({ error: "Failed to fetch data" }, 500);
  }
});

// --- APPROVE A HOSPITAL ---
app.post("/make-server-5e1d66c4/admin/hospitals/approve", async (c: Context) => {
  try {
    const { hospitalId } = await c.req.json();

    if (!hospitalId) {
      return c.json({ error: "Missing hospital ID" }, 400);
    }

    const result = await db.execute({
      sql: "UPDATE hospitals SET status = 'activated' WHERE id = ?",
      args: [hospitalId]
    });

    if (result.rowsAffected === 0) {
      return c.json({ error: "Hospital not found" }, 404);
    }

    return c.json({ success: true, message: "Hospital activated successfully" });
  } catch (err) {
    console.error("Approval error:", err);
    return c.json({ error: "Failed to approve hospital" }, 500);
  }
});

// --- REJECT A HOSPITAL (HARD DELETE) ---
app.delete("/make-server-5e1d66c4/hospitals/:id", async (c: Context) => {
  try {
    // 1. Grab the ID directly from the URL (matches our new frontend fetch route)
    const id = c.req.param("id");

    if (!id) {
      return c.json({ error: "Missing hospital ID" }, 400);
    }

    // 2. Execute the Hard Delete to wipe the row completely
    const result = await db.execute({
      sql: "DELETE FROM hospitals WHERE id = ?",
      args: [id]
    });

    if (result.rowsAffected === 0) {
      return c.json({ error: "Hospital not found or already deleted" }, 404);
    }

    return c.json({ success: true, message: "Hospital permanently wiped" });
  } catch (err) {
    console.error("Deletion error:", err);
    return c.json({ error: "Failed to wipe hospital account" }, 500);
  }
});

// HOSPITAL LOGIN
app.post("/make-server-5e1d66c4/hospital/login", async (c: Context) => {
  try {
    const { email, password } = await c.req.json();

    // 1. Find the hospital in the database
    const result = await db.execute({
      sql: "SELECT * FROM hospitals WHERE email = ?",
      args: [email]
    });

    if (result.rows.length === 0) {
      return c.json({ success: false, error: "Email tidak ditemukan" }, 404);
    }

    const hospital = result.rows[0];

    // 2. Verify the Password
    const isValidPassword = await bcrypt.compare(password, String(hospital.password_hash));
    if (!isValidPassword) {
      return c.json({ success: false, error: "Password salah" }, 401);
    }

    // 3. Verify Admin Approval
    if (hospital.status === "pending") {
      return c.json({ success: false, error: "Akun Anda belum diaktivasi oleh Admin. Silakan tunggu." }, 403);
    }
    if (hospital.status === "rejected") {
      return c.json({ success: false, error: "Pendaftaran akun Anda ditolak oleh Admin." }, 403);
    }

    // --- THE UPGRADE: GENERATE THE VIP PASS (JWT) ---
    // We encode their ID and email, and set an expiration time (e.g., 24 hours)
    const payload = {
      id: hospital.id,
      email: hospital.email,
      role: "hospital",
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // Expires in 24 hours
    };

    // Sign the token using the same JWT_SECRET that the middleware uses to verify
    const token = await sign(payload, JWT_SECRET);

    // 4. Success! Send the hospital data AND THE TOKEN back to the frontend
    return c.json({ success: true, token: token, data: hospital });

  } catch (err) {
    console.error("Login error:", err);
    return c.json({ success: false, error: "Terjadi kesalahan pada server" }, 500);
  }
});

// ADMIN LOGIN
app.post("/make-server-5e1d66c4/admin/login", async (c: Context) => {
  try {
    // 1. Get the raw data and print it to the terminal!
    const body = await c.req.json();
    console.log("➡️ FRONTEND SENT:", body);

    // 2. Accept either 'username' OR 'email' so it never fails on a naming mismatch
    const loginName = body.username || body.email;
    const password = body.password;

    // Safety check
    if (!loginName || !password) {
      console.log("❌ Missing credentials in request!");
      return c.json({ error: "Missing credentials" }, 400);
    }

    // 3. Search for the user in Turso
    console.log(`➡️ LOOKING UP: ${loginName}`);
    const result = await db.execute({
      sql: "SELECT * FROM admins WHERE username = ?",
      args: [loginName]
    });

    // If no user found, reject
    if (result.rows.length === 0) {
      console.log("❌ User not found in database!");
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const admin = result.rows[0];

    // 4. Use Bcrypt to check the hashed password
    const isValid = await bcrypt.compare(password, String(admin.password_hash));

    if (!isValid) {
      console.log("❌ Password mismatch!");
      return c.json({ error: "Invalid credentials" }, 401);
    }

    console.log("✅ LOGIN SUCCESSFUL!");

    // 5. Success! Generate the JWT Token so the frontend stays logged in
    const token = await sign({
      username: admin.username,
      role: admin.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // Token expires in 24 hours
    }, JWT_SECRET);

    return c.json({
      success: true,
      token: token, // Handing the key back to the frontend
      adminData: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("🔥 FATAL LOGIN ERROR:", errorMessage);
    return c.json({ error: "Login failed" }, 500);
  }
});
// ============ PROTECTED ROUTES ============
// Ensure ALL new routes are protected by the JWT middleware
app.use('/make-server-5e1d66c4/surveys/*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));
app.use('/make-server-5e1d66c4/patients/*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));
app.use('/make-server-5e1d66c4/drafts/*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));
app.use('/make-server-5e1d66c4/hospital/accounts*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));
app.use('/make-server-5e1d66c4/submissions*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));
app.use('/make-server-5e1d66c4/rankings*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));
app.use('/news*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));
app.use('/events*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));

// ============ SURVEYS ============

// GET surveys
app.get("/make-server-5e1d66c4/surveys/:hospitalCode/:specialty", async (c: Context) => {
  try {
    const { hospitalCode, specialty } = c.req.param();
    const rs = await db.execute({
      sql: "SELECT * FROM surveys WHERE hospital_code = ? AND specialty = ? ORDER BY created_at DESC",
      args: [hospitalCode, specialty]
    });

    const surveys = rs.rows.map((r: unknown) => {
      const row = r as SurveyRow;
      return {
        id: row.id,
        patientName: row.patient_name,
        medicalRecordNumber: row.patient_rm,
        premScore: row.prem_score,
        promScore: row.prom_score,
        overallScore: row.overall_score,
        answers: row.answers ? JSON.parse(row.answers) : {},
        timestamp: row.created_at
      };
    });

    return c.json({ surveys });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error getting surveys:", errorMessage);
    return c.json({ error: `Failed to get surveys: ${errorMessage}` }, 500);
  }
});

// POST submit a survey
app.post("/make-server-5e1d66c4/surveys/:hospitalCode/:specialty", async (c: Context) => {
  try {
    const { hospitalCode, specialty } = c.req.param();
    const survey = await c.req.json();
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);

    const existing = await db.execute({
      sql: "SELECT id FROM surveys WHERE hospital_code = ? AND specialty = ? AND patient_rm = ?",
      args: [hospitalCode, specialty, survey.medicalRecordNumber || survey.qRm || ""]
    });

    if (existing.rows.length > 0) {
      return c.json({ error: "Pasien ini sudah mengisi survei.", success: false, duplicate: true }, 409);
    }

    await db.execute({
      sql: `INSERT INTO surveys (id, hospital_code, specialty, patient_name, patient_rm, prem_score, prom_score, overall_score, answers)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        hospitalCode,
        specialty,
        survey.patientName || survey.qName || "",
        survey.medicalRecordNumber || survey.qRm || "",
        survey.premScore ?? 0,
        survey.promScore ?? 0,
        survey.overallScore ?? 0,
        JSON.stringify(survey.answers || {})
      ]
    });

    return c.json({ success: true, surveyId: id });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error submitting survey:", errorMessage);
    return c.json({ error: `Failed to submit survey: ${errorMessage}` }, 500);
  }
});

// POST bulk add surveys (N+1 Performance Fix)
app.post("/make-server-5e1d66c4/surveys/:hospitalCode/:specialty/bulk", async (c: Context) => {
  try {
    const { hospitalCode, specialty } = c.req.param();
    const { surveys } = await c.req.json();

    // Map JSON array into Turso SQL Transaction objects
    const statements = surveys.map((survey: SurveyInput) => {
      const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      return {
        sql: `INSERT INTO surveys (id, hospital_code, specialty, patient_name, patient_rm, prem_score, prom_score, overall_score, answers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, hospitalCode, specialty, survey.patientName || survey.qName || "",
          survey.medicalRecordNumber || survey.qRm || "", survey.premScore ?? 0,
          survey.promScore ?? 0, survey.overallScore ?? 0, JSON.stringify(survey.answers || {})
        ]
      };
    });

    // Execute everything in one massive batch
    await db.batch(statements, "write");
    return c.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Bulk Add Error:", errorMessage);
    return c.json({ error: "Failed to bulk add surveys" }, 500);
  }
});

// DELETE reset all surveys
app.delete("/make-server-5e1d66c4/surveys/:hospitalCode/:specialty", async (c: Context) => {
  try {
    const { hospitalCode, specialty } = c.req.param();
    await db.execute({
      sql: "DELETE FROM surveys WHERE hospital_code = ? AND specialty = ?",
      args: [hospitalCode, specialty]
    });
    return c.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error resetting surveys:", errorMessage);
    return c.json({ error: `Failed to reset surveys: ${errorMessage}` }, 500);
  }
});

// ============ REGISTERED PATIENTS ============

// GET patients
app.get("/make-server-5e1d66c4/patients/:hospitalCode/:specialty", async (c: Context) => {
  try {
    const { hospitalCode, specialty } = c.req.param();
    const rs = await db.execute({
      sql: "SELECT * FROM patients WHERE hospitalCode = ? AND specialty = ? ORDER BY registeredAt ASC",
      args: [hospitalCode, specialty]
    });

    const patients = rs.rows.map((r: unknown) => {
      const row = r as PatientRow;
      return {
        id: row.id,
        name: row.patientName,
        rm: row.mrn,
        specialty,
        hospitalCode,
        createdAt: row.registeredAt
      };
    });

    return c.json({ patients });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error getting patients:", errorMessage);
    return c.json({ error: `Failed to get patients: ${errorMessage}` }, 500);
  }
});

// POST register patient
app.post("/make-server-5e1d66c4/patients/:hospitalCode/:specialty", async (c: Context) => {
  try {
    const { hospitalCode, specialty } = c.req.param();
    const patient = await c.req.json();
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);

    const existing = await db.execute({
      sql: "SELECT id FROM patients WHERE hospitalCode = ? AND specialty = ? AND mrn = ?",
      args: [hospitalCode, specialty, patient.rm || ""]
    });

    if (existing.rows.length > 0) {
      return c.json({ error: "Nomor rekam medis sudah terdaftar.", success: false, duplicate: true }, 409);
    }

    await db.execute({
      sql: "INSERT INTO patients (id, hospitalCode, specialty, patientName, mrn) VALUES (?, ?, ?, ?, ?)",
      args: [id, hospitalCode, specialty, patient.name, patient.rm]
    });

    return c.json({ success: true, patient: { id, name: patient.name, rm: patient.rm } });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error registering patient:", errorMessage);
    return c.json({ error: `Failed to register patient: ${errorMessage}` }, 500);
  }
});

// DELETE remove patient
app.delete("/make-server-5e1d66c4/patients/:hospitalCode/:specialty/:patientId", async (c: Context) => {
  try {
    const { hospitalCode, specialty, patientId } = c.req.param();
    await db.execute({
      sql: "DELETE FROM patients WHERE id = ? AND hospitalCode = ? AND specialty = ?",
      args: [patientId, hospitalCode, specialty]
    });
    return c.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error removing patient:", errorMessage);
    return c.json({ error: `Failed to remove patient: ${errorMessage}` }, 500);
  }
});

// ============ DRAFTS ============

// GET draft
app.get("/make-server-5e1d66c4/drafts/:type/:hospitalCode/:specialty", async (c: Context) => {
  try {
    const { type, hospitalCode, specialty } = c.req.param();
    const draftKey = `${type}-${hospitalCode}-${specialty}`;

    const existing = await db.execute({
      sql: "SELECT data FROM drafts WHERE draft_key = ?",
      args: [draftKey]
    });

    let draft = null;
    if (existing.rows.length > 0) {
      const row = existing.rows[0] as unknown as DraftRow;
      draft = JSON.parse(row.data);
    }

    return c.json({ draft });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error getting draft:", errorMessage);
    return c.json({ error: `Failed to get draft: ${errorMessage}` }, 500);
  }
});

// POST save draft
app.post("/make-server-5e1d66c4/drafts/:type/:hospitalCode/:specialty", async (c: Context) => {
  try {
    const { type, hospitalCode, specialty } = c.req.param();
    const draft = await c.req.json();
    const draftKey = `${type}-${hospitalCode}-${specialty}`;
    const dataStr = JSON.stringify(draft);

    const existing = await db.execute({
      sql: "SELECT draft_key FROM drafts WHERE draft_key = ?",
      args: [draftKey]
    });

    if (existing.rows.length > 0) {
      await db.execute({
        sql: "UPDATE drafts SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE draft_key = ?",
        args: [dataStr, draftKey]
      });
    } else {
      await db.execute({
        sql: "INSERT INTO drafts (draft_key, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
        args: [draftKey, dataStr]
      });
    }

    return c.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error saving draft:", errorMessage);
    return c.json({ error: `Failed to save draft: ${errorMessage}` }, 500);
  }
});

// DELETE draft
app.delete("/make-server-5e1d66c4/drafts/delete/:draftId", async (c: Context) => {
  try {
    const { draftId } = c.req.param();
    await db.execute({ sql: "DELETE FROM drafts WHERE draft_key = ?", args: [draftId] });
    return c.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Delete draft error:", errorMessage);
    return c.json({ error: "Failed to delete draft" }, 500);
  }
});

// ============ HOSPITAL ACCOUNTS (ADMIN) ============

app.get("/make-server-5e1d66c4/hospital/accounts", async (c: Context) => {
  try {
    const rs = await db.execute("SELECT * FROM hospital_accounts ORDER BY registered_at DESC");
    const accounts = rs.rows.map((r: unknown) => {
      const row = r as HospitalAccountRow;
      return {
        email: row.email,
        hospitalName: row.hospital_name,
        picName: row.pic_name,
        province: row.province,
        city: row.city,
        status: row.status
      };
    });
    return c.json({ accounts });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Get accounts error:", errorMessage);
    return c.json({ error: "Failed to fetch accounts" }, 500);
  }
});

app.put("/make-server-5e1d66c4/hospital/accounts/status", async (c: Context) => {
  try {
    const { email, status } = await c.req.json();
    await db.execute({
      sql: "UPDATE hospital_accounts SET status = ? WHERE email = ?",
      args: [status, email]
    });
    return c.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Update account status error:", errorMessage);
    return c.json({ error: "Failed to update status" }, 500);
  }
});

// ============ SUBMISSIONS ============

app.post("/make-server-5e1d66c4/submissions", async (c: Context) => {
  try {
    const submission = await c.req.json();

    // Safely extract the scores (default to 0 if missing)
    const rsbk = submission.scores?.rsbk || 0;
    const audit = submission.scores?.audit || 0;
    const prm = submission.scores?.prm || 0;
    const final = submission.scores?.final || 0;

    await db.execute({
      sql: `INSERT OR IGNORE INTO submissions (
        id, 
        hospitalName, 
        specialty, 
        status, 
        rsbkScore, 
        auditScore, 
        prmScore, 
        final_score, 
        created_at, 
        data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        submission.id,
        submission.hospitalName,
        submission.specialty || "-",
        submission.status || "pending",
        rsbk,
        audit,
        prm,
        final,
        submission.submittedDate || new Date().toISOString(), // maps to created_at
        JSON.stringify(submission) // Packs picName, details, and everything else safely into the 'data' column!
      ]
    });
    return c.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Add submission error:", errorMessage);
    return c.json({ error: "Failed to add submission" }, 500);
  }
});

app.get("/make-server-5e1d66c4/submissions", async (c: Context) => {
  try {
    const rs = await db.execute(`
      SELECT s.*, h.city AS h_city, h.province AS h_province, h.pic_name AS h_pic_name 
      FROM submissions s 
      LEFT JOIN (
        SELECT hospital_name, city, province, pic_name 
        FROM hospitals 
        GROUP BY hospital_name
      ) h ON s.hospitalName = h.hospital_name 
      ORDER BY s.created_at DESC
    `);

    const submissions = rs.rows.map((r: unknown) => {
      const row = r as any; // Using 'any' here since we changed the schema layout

      // Unpack the JSON 'data' column to get our extra fields back
      const fullData = row.data ? JSON.parse(row.data) : {};

      return {
        id: row.id,
        hospitalName: row.hospitalName,
        specialty: row.specialty,
        status: row.status,
        picName: (row.h_pic_name && row.h_pic_name !== "-") ? row.h_pic_name : (fullData.picName || "-"),
        city: (row.h_city && row.h_city !== "-") ? row.h_city : (fullData.city || "-"),
        province: (row.h_province && row.h_province !== "-") ? row.h_province : (fullData.province || "-"),
        submittedDate: row.created_at,
        scores: {
          rsbk: row.rsbkScore,
          audit: row.auditScore,
          prm: row.prmScore,
          final: row.final_score
        },
        details: fullData.details || {}
      };
    });

    return c.json({ submissions });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Get submissions error:", errorMessage);
    return c.json({ error: "Failed to get submissions" }, 500);
  }
});

app.put("/make-server-5e1d66c4/submissions/:id/status", async (c: Context) => {
  try {
    const { id } = c.req.param();
    const { status } = await c.req.json();
    await db.execute({ sql: "UPDATE submissions SET status = ? WHERE id = ?", args: [status, id] });
    return c.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Update submission status error:", errorMessage);
    return c.json({ error: "Failed to update status" }, 500);
  }
});

// ============ RANKINGS ============

app.post("/make-server-5e1d66c4/rankings", async (c: Context) => {
  try {
    const r = await c.req.json();
    const existing = await db.execute({ sql: "SELECT id FROM rankings WHERE submission_id = ?", args: [r.submissionId] });

    if (existing.rows.length > 0) {
      await db.execute({
        sql: `UPDATE rankings SET hospital_name=?, city=?, province=?, specialty=?, final_score=?, rsbk_score=?, clinical_audit_score=?, patient_report_score=?, grade=?, approved_at=? WHERE submission_id=?`,
        args: [r.hospitalName, r.city, r.province, r.specialty, r.finalScore, r.rsbkScore, r.clinicalAuditScore, r.patientReportScore, r.grade, r.approvedAt, r.submissionId]
      });
    } else {
      await db.execute({
        sql: `INSERT INTO rankings (id, hospital_name, city, province, specialty, final_score, rsbk_score, clinical_audit_score, patient_report_score, grade, approved_at, submission_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [r.id, r.hospitalName, r.city, r.province, r.specialty, r.finalScore, r.rsbkScore, r.clinicalAuditScore, r.patientReportScore, r.grade, r.approvedAt, r.submissionId]
      });
    }
    return c.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Publish ranking error:", errorMessage);
    return c.json({ error: "Failed to publish ranking" }, 500);
  }
});

app.get("/make-server-5e1d66c4/rankings", async (c: Context) => {
  try {
    const rs = await db.execute(`
      SELECT r.*, h.city AS h_city, h.province AS h_province 
      FROM rankings r 
      LEFT JOIN hospitals h ON r.hospital_name = h.hospital_name 
      ORDER BY r.final_score DESC
    `);

    const rankings = rs.rows.map((row: any) => {
      // Prefer the hospital table's location over the submission's if available
      const finalCity = (row.h_city && row.h_city !== "-") ? row.h_city : row.city;
      const finalProvince = (row.h_province && row.h_province !== "-") ? row.h_province : row.province;

      return {
        id: row.id,
        hospitalName: row.hospital_name,
        city: finalCity,
        province: finalProvince,
        specialty: row.specialty,
        finalScore: row.final_score,
        rsbkScore: row.rsbk_score,
        clinicalAuditScore: row.clinical_audit_score,
        patientReportScore: row.patient_report_score,
        grade: row.grade,
        approvedAt: row.approved_at,
        submissionId: row.submission_id
      };
    });

    // THE FIX: Added success: true so the frontend accepts the data!
    return c.json({ success: true, rankings });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Get rankings error:", errorMessage);
    return c.json({ success: false, error: "Failed to get rankings" }, 500);
  }
});

app.delete("/make-server-5e1d66c4/rankings/:submissionId", async (c: Context) => {
  try {
    const { submissionId } = c.req.param();
    await db.execute({ sql: "DELETE FROM rankings WHERE submission_id = ?", args: [submissionId] });
    return c.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Unpublish ranking error:", errorMessage);
    return c.json({ error: "Failed to unpublish ranking" }, 500);
  }
});

// ============ NEWS & EVENTS (STUBBED) ============

app.post("/news", (c: Context) => { return c.json({ success: true }); });
app.get("/news", (c: Context) => { return c.json({ news: [] }); });
app.delete("/news/:id", (c: Context) => { return c.json({ success: true }); });

app.post("/events", (c: Context) => { return c.json({ success: true }); });
app.get("/events", (c: Context) => { return c.json({ events: [] }); });
app.delete("/events/:id", (c: Context) => { return c.json({ success: true }); });

Deno.serve(app.fetch);