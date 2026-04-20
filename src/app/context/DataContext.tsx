import { SubmissionData } from "../utils/api";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {
  getAllSubmissions,
  getAllRankingsFromDb,
  API_BASE_URL
} from "../utils/api";



// Helper function to generate headers with the Authorization token
const getAuthHeaders = () => {
  const token = localStorage.getItem("hospitalToken") || sessionStorage.getItem("auth_token") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

// ============ TYPES ============
export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: "berita" | "publikasi" | "regulasi" | "inovasi";
  imageUrl: string;
  author: string;
  publishedAt: string;
  featured: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  type: "seminar" | "workshop" | "congress" | "webinar";
  imageUrl: string;
  registrationUrl?: string;
  featured: boolean;
}

export interface HospitalAccount {
  id?: string;
  email: string;
  hospitalName: string;
  picName: string;
  province: string;
  city: string;
  registeredAt: string;
  status: "pending_activation" | "activated" | "rejected" | "pending";
  suratTugasFileName?: string;
  suratTugasData?: string;
}

export interface ApprovedRanking {
  id: string;
  hospitalName: string;
  city: string;
  province: string;
  specialty: string;
  finalScore: number;
  rsbkScore: number;
  clinicalAuditScore: number;
  patientReportScore: number;
  grade: string;
  approvedAt: string;
  submissionId: string;
}

// ============ CONTEXT ============
interface DataContextType {
  news: NewsItem[];
  // FIX 3: Changed return types to Promise<boolean> for UI error handling
  addNews: (item: Omit<NewsItem, "id">) => Promise<boolean>;
  updateNews: (id: string, item: Partial<NewsItem>) => Promise<boolean>;
  deleteNews: (id: string) => Promise<boolean>;

  events: EventItem[];
  addEvent: (item: Omit<EventItem, "id">) => Promise<boolean>;
  updateEvent: (id: string, item: Partial<EventItem>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;

  registerHospitalFull: (email: string, password: string, hospitalName: string, picName: string, suratTugasFileName: string, suratTugasData: string, province?: string, city?: string) => Promise<boolean>;
  loginHospital: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;

  isAdmin: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;

  currentHospital: HospitalAccount | null;
  hospitalLogout: () => void;

  hospitalAccounts: HospitalAccount[];
  activateHospital: (email: string) => void;
  rejectHospital: (email: string) => void;

  fetchAllHospitals: () => Promise<any[]>;
  approveHospital: (hospitalId: string) => Promise<boolean>;
  rejectHospitalDB: (hospitalId: string) => Promise<boolean>;

  approvedRankings: ApprovedRanking[];
  publishRanking: (ranking: Omit<ApprovedRanking, "id">) => void;
  unpublishRanking: (submissionId: string) => void;
  submissions: SubmissionData[];
  addSubmission: (submission: Omit<SubmissionData, "id">) => void;
  updateSubmissionStatus: (id: string, status: SubmissionData["status"], notes?: string) => void;
  approveSubmission: (submission: any) => Promise<boolean>;
  rejectSubmission: (submissionId: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | null>(null);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [news, setNews] = useState<NewsItem[]>(() => loadFromStorage("persi_news", []));
  const [events, setEvents] = useState<EventItem[]>(() => loadFromStorage("persi_events", []));

  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem("persi_admin") === "true");
  const [currentHospital, setCurrentHospital] = useState<HospitalAccount | null>(() => {
    const stored = sessionStorage.getItem("persi_hospital_session");
    return stored ? JSON.parse(stored) : null;
  });
  const [hospitalAccounts, setHospitalAccounts] = useState<HospitalAccount[]>([]);

  const [approvedRankings, setApprovedRankings] = useState<ApprovedRanking[]>(() => loadFromStorage("persi_rankings", []));
  const [submissions, setSubmissions] = useState<SubmissionData[]>(() => loadFromStorage("persi_submissions", []));

  useEffect(() => {
    async function syncSubmissions() {
      try {
        const dbSubs = await getAllSubmissions();
        // Deduplicate by id to prevent duplicate key warnings
        const uniqueSubs = dbSubs.filter((sub, index, arr) =>
          arr.findIndex(s => s.id === sub.id) === index
        );
        setSubmissions(uniqueSubs);
        localStorage.setItem("persi_submissions", JSON.stringify(uniqueSubs));
      } catch (err) {
        console.error("Failed to sync submissions:", err);
      }
    }
    syncSubmissions();

    async function syncRankings() {
      try {
        const dbRankings = await getAllRankingsFromDb();
        setApprovedRankings(dbRankings);
        localStorage.setItem("persi_rankings", JSON.stringify(dbRankings));
      } catch (err) {
        console.error("Failed to sync rankings:", err);
      }
    }
    syncRankings();

    async function syncNewsAndEvents() {
      try {
        const newsResponse = await fetch(`${API_BASE_URL}/news`);
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          // Only overwrite if the server gives us real data, otherwise keep local
          if (newsData.news && newsData.news.length > 0) {
            setNews(newsData.news);
          }
        }

        const eventsResponse = await fetch(`${API_BASE_URL}/events`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          // Only overwrite if the server gives us real data, otherwise keep local
          if (eventsData.events && eventsData.events.length > 0) {
            setEvents(eventsData.events);
          }
        }
      } catch (err) {
        console.error("Failed to fetch news/events from server:", err);
      }
    }
    syncNewsAndEvents();
  }, []);

  useEffect(() => { localStorage.setItem("persi_rankings", JSON.stringify(approvedRankings)); }, [approvedRankings]);
  useEffect(() => { localStorage.setItem("persi_submissions", JSON.stringify(submissions)); }, [submissions]);
  useEffect(() => { localStorage.setItem("persi_news", JSON.stringify(news)); }, [news]);
  useEffect(() => { localStorage.setItem("persi_events", JSON.stringify(events)); }, [events]);

  // ============ NEWS MANAGEMENT ============
  const addNews = useCallback(async (item: Omit<NewsItem, "id">): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/news`, {
        method: "POST",
        headers: getAuthHeaders(), // FIX 1: Applied Auth Headers
        body: JSON.stringify(item)
      });
      if (response.ok) {
        const data = await response.json();
        const newItem = { ...item, id: data.id };
        setNews(prev => [newItem, ...prev]);
        return true; // FIX 3: Return true on success
      }
      return false;
    } catch (err) {
      console.error("Failed to add news:", err);
      return false; // FIX 3: Return false on catch
    }
  }, []);

  const updateNews = useCallback(async (id: string, item: Partial<NewsItem>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/news/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(item)
      });
      if (response.ok) {
        setNews(prev => prev.map(n => n.id === id ? { ...n, ...item } : n));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update news:", err);
      return false;
    }
  }, []);

  const deleteNews = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/news/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setNews(prev => prev.filter(n => n.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete news:", err);
      return false;
    }
  }, []);

  // ============ EVENTS MANAGEMENT ============
  const addEvent = useCallback(async (item: Omit<EventItem, "id">): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(item)
      });
      if (response.ok) {
        const data = await response.json();
        const newItem = { ...item, id: data.id };
        setEvents(prev => [newItem, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to add event:", err);
      return false;
    }
  }, []);

  const updateEvent = useCallback(async (id: string, item: Partial<EventItem>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(item)
      });
      if (response.ok) {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...item } : e));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update event:", err);
      return false;
    }
  }, []);

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setEvents(prev => prev.filter(e => e.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete event:", err);
      return false;
    }
  }, []);

  // ============ AUTHENTICATION ============
  const registerHospitalFull = useCallback(async (
    email: string, password: string, hospitalName: string, picName: string,
    suratTugasFileName: string, suratTugasData: string,
    province?: string, city?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/make-server-5e1d66c4/hospital/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
          hospitalName,
          picName,
          province: province || "",
          city: city || "",
          suratTugasFileName,
          suratTugasData,
        })
      });
      return response.ok;
    } catch (err) {
      console.error("Registration request failed:", err);
      return false;
    }
  }, []);

  // --- REAL DATABASE LOGIN ---
  const loginHospital = useCallback(async (email: string, pass: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/make-server-5e1d66c4/hospital/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 1. THE UPGRADE: Put the VIP Pass in the browser's pocket!
        localStorage.setItem("hospitalToken", result.token);

        // 2. --- THE NEW SESSION NORMALIZER ---
        // We clean up all the names here so the rest of the app never gets confused!
        const sessionToStore = {
          id: result.data.id,
          // We guarantee it is saved as "hospitalName" regardless of what Turso sent
          hospitalName: result.data.hospital_name || result.data.hospitalName || "Unknown Hospital",
          email: result.data.email,
          status: result.data.status,
          picName: result.data.pic_name || result.data.picName || "",
          province: result.data.province || "",
          city: result.data.city || "",
          suratTugasFileName: result.data.surat_tugas_filename || "",
          suratTugasData: result.data.surat_tugas_data || "",
          registeredAt: result.data.created_at || new Date().toISOString()
        };

        // Save it to browser storage (using both keys just to be bulletproof)
        sessionStorage.setItem("hospitalAuth", JSON.stringify(sessionToStore));
        sessionStorage.setItem("persi_hospital_session", JSON.stringify(sessionToStore));

        // 3. Log them into the React State using that exact same cleaned-up data!
        setCurrentHospital(sessionToStore);

        return { success: true };
      } else {
        // This catches our custom errors like "Belum diaktivasi" or "Password salah"
        return { success: false, error: result.error || "Login gagal" };
      }
    } catch (err) {
      console.error("Frontend Login Error:", err);
      return { success: false, error: "Gagal terhubung ke server" };
    }
  }, []);

  const hospitalLogout = useCallback(() => {
    setCurrentHospital(null);
    sessionStorage.removeItem("persi_hospital_session");
    sessionStorage.removeItem("hospitalAuth");
    sessionStorage.removeItem("auth_token");

    // THE UPGRADE: Destroy the VIP Pass when they log out!
    localStorage.removeItem("hospitalToken");
  }, []);

  // ============ ADMIN AUTH ============
  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // Adjusted to include the full prefix if not already in API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/make-server-5e1d66c4/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // FIX: Change 'email' to 'username' so the backend recognizes it
        body: JSON.stringify({ username: email, password })
      });

      if (response.ok) {
        const data = await response.json();
        setIsAdmin(true);
        sessionStorage.setItem("persi_admin", "true");

        if (data.token) {
          sessionStorage.setItem("auth_token", data.token);
        }
        if (data.adminData) {
          sessionStorage.setItem("persi_admin_data", JSON.stringify(data.adminData));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Admin login failed", err);
      return false;
    }
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem("persi_admin");
    sessionStorage.removeItem("auth_token"); // FIX 1: Clear token on logout
  }, []);

  // Rankings & Submissions (Keep your exact logic here)
  const publishRanking = useCallback((_ranking: Omit<ApprovedRanking, "id">) => { /*...*/ }, []);
  const unpublishRanking = useCallback((_submissionId: string) => { /*...*/ }, []);

  const addSubmission = useCallback(async (subData: Omit<SubmissionData, "id">) => {
    try {
      // --- THE ULTIMATE NAME & LOCATION CATCHER (Prioritized Version) ---
      // 1. Grab raw session strings safely and parse them into objects
      const persiData = JSON.parse(sessionStorage.getItem("persi_hospital_session") || "{}");
      const authData = JSON.parse(sessionStorage.getItem("hospitalAuth") || "{}");

      // 2. Priority Ladder: React State -> persi_hospital_session -> hospitalAuth
      // This guarantees we find the data even if one of the storage banks gets corrupted!
      const realName =
        currentHospital?.hospitalName || (currentHospital as any)?.hospital_name ||
        persiData.hospitalName || persiData.hospital_name ||
        authData.hospitalName || authData.hospital_name ||
        "Unknown Hospital";

      const realCity = currentHospital?.city || persiData.city || authData.city || "-";
      const realProvince = currentHospital?.province || persiData.province || authData.province || "-";

      // 3. Package the final submission safely
      const newSubmission = {
        ...subData,
        id: crypto.randomUUID(),
        hospitalName: realName,
        city: realCity,
        province: realProvince
      };

      // 4. Send the data to your backend route
      const response = await fetch(`${API_BASE_URL}/make-server-5e1d66c4/submissions`, {
        method: "POST",
        headers: getAuthHeaders(), // Using your custom auth headers function
        body: JSON.stringify(newSubmission)
      });

      const result = await response.json();

      if (response.ok && (result.success || !result.error)) {
        console.log("Submission successful");
        // Update local state immediately, but deduplicate to avoid duplicate keys
        setSubmissions(prev => {
          const filtered = prev.filter(s => s.id !== newSubmission.id);
          return [newSubmission as unknown as SubmissionData, ...filtered];
        });
        return true;
      } else {
        console.error("Submission failed:", result.error);
        return false;
      }
    } catch (err) {
      console.error("Error submitting survey:", err);
      return false;
    }
  }, [currentHospital]); // Make sure currentHospital is in the dependency array!

  const updateSubmissionStatus = useCallback(async (_id: string, _status: SubmissionData["status"], _notes?: string) => { /*...*/ }, [unpublishRanking]);

  const approveSubmission = useCallback(async (submission: any) => {
    try {
      const token = sessionStorage.getItem("auth_token") || localStorage.getItem("hospitalToken") || localStorage.getItem("token");

      // STEP 1: Tell the server to change the status to "approved"
      const statusResponse = await fetch(`${API_BASE_URL}/make-server-5e1d66c4/submissions/${submission.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "approved" })
      });

      if (!statusResponse.ok) throw new Error("Failed to update status");

      // 1. The Auto-Grader Logic
      const finalScore = Number(submission.scores?.final || submission.finalScore || 0);
      let calculatedGrade = "D";
      if (finalScore >= 85) calculatedGrade = "A";
      else if (finalScore >= 70) calculatedGrade = "B";
      else if (finalScore >= 55) calculatedGrade = "C";

      // STEP 2: Package the data (Bulletproof version!)
      const rankingPayload = {
        id: crypto.randomUUID(),
        submissionId: submission.id,
        hospitalName: submission.hospitalName || "Unknown Hospital",
        city: submission.details?.city || submission.city || "-",
        province: submission.details?.province || submission.province || "-",
        specialty: submission.specialty || "-",
        // We wrap these in Number() to guarantee they are mathematically safe for Turso
        finalScore: Number(submission.scores?.final || submission.finalScore || 0),
        rsbkScore: Number(submission.scores?.rsbk || submission.rsbkScore || 0),
        clinicalAuditScore: Number(submission.scores?.audit || submission.auditScore || 0),
        patientReportScore: Number(submission.scores?.prm || submission.prmScore || 0),
        grade: calculatedGrade,
        approvedAt: new Date().toISOString()
      };

      const rankingResponse = await fetch(`${API_BASE_URL}/make-server-5e1d66c4/rankings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(rankingPayload)
      });

      if (rankingResponse.ok) {
        setSubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, status: "Approved" } : s));
        alert("Submission approved and published to rankings!");
        // Refresh your admin lists here if necessary
        return true;
      } else {
        alert("Approved, but failed to publish to rankings.");
        return false;
      }
    } catch (err) {
      console.error("Error approving submission:", err);
      alert("Terjadi kesalahan saat menyetujui data.");
      return false;
    }
  }, []);

  const rejectSubmission = useCallback(async (submissionId: string) => {
    try {
      const token = sessionStorage.getItem("auth_token") || localStorage.getItem("hospitalToken") || localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/make-server-5e1d66c4/submissions/${submissionId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "rejected" })
      });

      if (response.ok) {
        setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, status: "Revision Required" } : s));
        alert("Submission rejected.");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error rejecting submission:", err);
      return false;
    }
  }, []);

  // OLD LOCAL STATE APPROVAL (Keep this for now so your old UI doesn't break)
  const activateHospital = useCallback((email: string) => {
    setHospitalAccounts(prev => prev.map(a => a.email === email ? { ...a, status: "activated" } : a));
  }, []);
  const rejectHospital = useCallback((email: string) => {
    setHospitalAccounts(prev => prev.map(a => a.email === email ? { ...a, status: "rejected" } : a));
  }, []);

  // ---------------------------------------------------------
  // NEW REAL DATABASE FUNCTIONS
  // ---------------------------------------------------------
  const fetchAllHospitals = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/make-server-5e1d66c4/admin/hospitals`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || [];
    } catch (err) {
      console.error("Failed to fetch hospitals from backend:", err);
      return [];
    }
  }, []);

  const approveHospital = useCallback(async (hospitalId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/make-server-5e1d66c4/admin/hospitals/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId })
      });
      return response.ok;
    } catch (err) {
      console.error("Failed to approve hospital:", err);
      return false;
    }
  }, []);

  const rejectHospitalDB = useCallback(async (hospitalId: string): Promise<boolean> => {
    try {
      // 1. Grab the auth token so the server knows an Admin is doing this
      const token = sessionStorage.getItem("auth_token") || localStorage.getItem("hospitalToken") || localStorage.getItem("token");

      // 2. Point to the new Hard Delete route and use the DELETE method
      const response = await fetch(`${API_BASE_URL}/make-server-5e1d66c4/hospitals/${hospitalId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
        // Notice we completely removed the 'body: JSON.stringify...' because the ID is in the URL now!
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server refused to delete hospital:", errorData);
      }

      return response.ok;
    } catch (err) {
      console.error("Failed to reject hospital:", err);
      return false;
    }
  }, []);

  return (
    <DataContext.Provider value={{
      news, addNews, updateNews, deleteNews,
      events, addEvent, updateEvent, deleteEvent,
      registerHospitalFull, loginHospital,
      isAdmin, adminLogin, adminLogout,
      currentHospital, hospitalLogout,
      hospitalAccounts, activateHospital, rejectHospital,

      // ADDED THEM HERE! 
      fetchAllHospitals,
      approveHospital,
      rejectHospitalDB,

      approvedRankings, publishRanking, unpublishRanking,
      submissions, addSubmission, updateSubmissionStatus,
      approveSubmission, rejectSubmission,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}