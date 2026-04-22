export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export const PREFIX = "/make-server-5e1d66c4";

export const getAuthHeaders = () => {
  // 1. Check the primary storage (This catches our new, upgraded login pipeline)
  let token =
    localStorage.getItem("hospitalToken") ||
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("token");

  // 2. The Legacy Safety Net (Catches older sessions before our fixes)
  if (!token && sessionStorage.getItem("hospitalAuth")) {
    try {
      const authData = JSON.parse(sessionStorage.getItem("hospitalAuth") || "{}");
      token = authData.token || null;
    } catch (e) {
      console.warn("Failed to parse legacy hospital auth token");
    }
  }

  // 3. Return the fully formed header
  return {
    "Content-Type": "application/json",
    // If a token exists, staple it to the request. If not, send without it.
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

// ============ TYPES & INTERFACES ============

export interface HospitalAccountData {
  email: string;
  password?: string;
  hospitalName: string;
  picName: string;
  province?: string;
  city?: string;
  status?: string;
}

export interface SubmissionData {
  id: string;
  hospitalName: string;
  specialty: string;
  picName: string;
  submittedDate: string;
  status: string;
  scores: Record<string, unknown>;
  details?: Record<string, unknown>;
  reviewerNotes?: string;
}

export interface RankingData {
  id: string;
  submissionId: string;
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
}

export interface NewsData {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
  featured: boolean;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  type: string;
  imageUrl: string;
  registrationUrl?: string;
  featured: boolean;
}

export interface SurveyData {
  patientName?: string;
  qName?: string;
  medicalRecordNumber?: string;
  qRm?: string;
  premScore?: number;
  promScore?: number;
  overallScore?: number;
  answers?: Record<string, unknown>;
}

export interface PatientData {
  name: string;
  rm: string;
}

// ============ HOSPITAL ACCOUNTS ============

export async function addHospitalAccount(acc: HospitalAccountData): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${PREFIX}/hospital/register`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(acc)
  });
  if (!response.ok) throw new Error("Failed to register hospital account");
}

export async function getAllHospitalAccounts(): Promise<HospitalAccountData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/hospital/accounts`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.accounts || [];
  } catch (err) {
    console.error("Get Accounts Error:", err);
    return [];
  }
}

export async function updateAccountStatus(email: string, status: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/hospital/accounts/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, status })
    });
    return response.ok;
  } catch (err) {
    console.error("Update Account Status Error:", err);
    return false;
  }
}

// ============ SUBMISSIONS (ADMIN DASHBOARD) ============

export async function addSubmission(submission: SubmissionData): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/submissions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(submission)
    });
    return response.ok;
  } catch (err) {
    console.error("Add Submission Error:", err);
    return false;
  }
}

export async function getAllSubmissions(): Promise<SubmissionData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/submissions`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.submissions || [];
  } catch (err) {
    console.error("Get Submissions Error:", err);
    return [];
  }
}

export async function updateSubmissionStatus(id: string, status: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/submissions/${id}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return response.ok;
  } catch (err) {
    console.error("Update Status Error:", err);
    return false;
  }
}

// ============ RANKINGS ============

export async function publishRankingToDb(ranking: RankingData): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/rankings`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(ranking)
    });
    return response.ok;
  } catch (err) {
    console.error("Publish Ranking Error:", err);
    return false;
  }
}

export async function unpublishRankingFromDb(submissionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/rankings/${submissionId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return response.ok;
  } catch (err) {
    console.error("Unpublish Ranking Error:", err);
    return false;
  }
}

export async function getAllRankingsFromDb(): Promise<RankingData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/rankings`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.rankings || [];
  } catch (err) {
    console.error("Get All Rankings Error:", err);
    return [];
  }
}

// ============ NEWS ============

export async function addNewsToDb(news: NewsData): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/news`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(news)
    });
    return response.ok;
  } catch (err) {
    console.error("Add News Error:", err);
    return false;
  }
}

export async function deleteNewsFromDb(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return response.ok;
  } catch (err) {
    console.error("Delete News Error:", err);
    return false;
  }
}

export async function getAllNews(): Promise<NewsData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/news`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.news || [];
  } catch (err) {
    console.error("Get All News Error:", err);
    return [];
  }
}

// ============ EVENTS ============

export async function addEventToDb(event: EventData): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(event)
    });
    return response.ok;
  } catch (err) {
    console.error("Add Event Error:", err);
    return false;
  }
}

export async function deleteEventFromDb(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return response.ok;
  } catch (err) {
    console.error("Delete Event Error:", err);
    return false;
  }
}

export async function getAllEvents(): Promise<EventData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.events || [];
  } catch (err) {
    console.error("Get All Events Error:", err);
    return [];
  }
}

// ============ PATIENT SURVEYS ============

export async function submitSurvey(
  hospitalCode: string,
  specialty: string,
  survey: SurveyData
): Promise<{ success: boolean; surveyId?: string; duplicate?: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/surveys/${hospitalCode}/${specialty}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(survey)
    });

    if (!response.ok) {
      const isJson = response.headers.get("content-type")?.includes("application/json");
      if (isJson) {
        const data = await response.json();
        return { success: false, duplicate: data.duplicate };
      }
      return { success: false };
    }

    const data = await response.json();
    return { success: true, surveyId: data.surveyId };
  } catch (err) {
    console.error("Submit Survey Error:", err);
    throw err;
  }
}

export async function getSurveys(hospitalCode: string, specialty: string): Promise<SurveyData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/surveys/${hospitalCode}/${specialty}`, {
      method: "GET", // THE FIX: Explicitly declare the method
      headers: getAuthHeaders()
    });

    if (!response.ok) return [];

    // Safely parse JSON
    const isJson = response.headers.get("content-type")?.includes("application/json");
    if (!isJson) return [];

    const data = await response.json();
    return data.surveys || [];
  } catch (err) {
    console.error("Get Surveys Error:", err);
    return [];
  }
}

export async function resetSurveys(hospitalCode: string, specialty: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/surveys/${hospitalCode}/${specialty}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return response.ok;
  } catch (err) {
    console.error("Reset Surveys Error:", err);
    return false;
  }
}

// ============ REGISTERED PATIENTS ============

export async function registerPatient(
  hospitalCode: string,
  specialty: string,
  patient: PatientData
): Promise<{ success: boolean; duplicate?: boolean; patient?: PatientData; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/patients/${hospitalCode}/${specialty}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(patient)
    });

    if (!response.ok) {
      const isJson = response.headers.get("content-type")?.includes("application/json");
      if (isJson) {
        const data = await response.json();
        return { success: false, duplicate: data.duplicate, error: data.error };
      }
      return { success: false, error: "Unauthorized or server error" };
    }

    const data = await response.json();
    return { success: true, patient: data.patient };
  } catch (err) {
    console.error("Register Patient Error:", err);
    return { success: false, error: "Network error" };
  }
}

export async function getPatients(hospitalCode: string, specialty: string): Promise<PatientData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/patients/${hospitalCode}/${specialty}`, {
      method: "GET", // THE FIX: Explicitly declare the method
      headers: getAuthHeaders()
    });

    if (!response.ok) return [];

    const isJson = response.headers.get("content-type")?.includes("application/json");
    if (!isJson) return [];

    const data = await response.json();
    return data.patients || [];
  } catch (err) {
    console.error("Get Patients Error:", err);
    return [];
  }
}

export async function removePatient(hospitalCode: string, specialty: string, patientId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/patients/${hospitalCode}/${specialty}/${patientId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return response.ok;
  } catch (err) {
    console.error("Remove Patient Error:", err);
    return false;
  }
}

// ============ DRAFTS ============

export async function getDraft(
  type: "clinical-audit" | "patient-report",
  hospitalCode: string,
  specialty: string
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/drafts/${type}/${hospitalCode}/${specialty}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.draft || null;
  } catch (err) {
    console.error("Get Draft Error:", err);
    return null;
  }
}

export async function saveDraft(
  type: "clinical-audit" | "patient-report",
  hospitalCode: string,
  specialty: string,
  draft: Record<string, unknown>
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/drafts/${type}/${hospitalCode}/${specialty}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(draft)
    });
    return response.ok;
  } catch (err) {
    console.error("Save Draft Error:", err);
    return false;
  }
}

export const saveHospitalDraft = async (hospitalCode: string, specialty: string, draftData: any): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/drafts/hospital-assessment/${hospitalCode}/${specialty}`, {
      method: "POST",
      // THE FIX: Use our central VIP Pass generator so it never misses a token!
      headers: getAuthHeaders(),
      body: JSON.stringify(draftData),
    });

    return response.ok;
  } catch (err) {
    console.error("Error saving cloud draft:", err);
    return false;
  }
};

export const getAllHospitalDrafts = async (hospitalCode: string, specialty: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/drafts/hospital-assessment/${hospitalCode}/${specialty}`, {
      method: "GET",
      // THE FIX: Use our central VIP Pass generator here too!
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const result = await response.json();
      return result.draft ? [result.draft] : [];
    }
    return [];
  } catch (err) {
    console.error("Error fetching cloud drafts:", err);
    return [];
  }
};

export const deleteHospitalDraft = async (draftId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/drafts/delete/${draftId}`, {
      method: "DELETE",
      // Use the upgraded auth headers so the server doesn't reject the request
      headers: getAuthHeaders() 
    });

    return response.ok;
  } catch (err) {
    console.error("Error deleting cloud draft:", err);
    return false;
  }
};

// ============ BULK ACTIONS ============

export async function bulkAddSurveys(hospitalCode: string, specialty: string, surveys: SurveyData[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREFIX}/surveys/${hospitalCode}/${specialty}/bulk`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ surveys })
    });
    return response.ok;
  } catch (err) {
    console.error("Bulk Add Surveys Error:", err);
    return false;
  }
}