import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  MessageSquare,
  Heart,
  ChevronRight,
  Save,
  QrCode,
  X,
  Download,
  Copy,
  RefreshCw,
  UserPlus,
  Users,
  Trash2,
  Eye,
  CheckCircle2,
  Loader2,
  FileUp,
  UploadCloud,
  FileText,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { QRCodeDisplay } from "../components/QRCodeGenerator";
import { specialtyAuditData } from "../data/specialtyAuditData";
import { SpecialtyProgressTracker } from "../components/SpecialtyProgressTracker";
import type { PatientSurveyResponse } from "./PatientPremPromPage";
import * as api from "../utils/api";
import { draftManager } from "../utils/draftManager";

interface RegisteredPatient {
  id: string;
  name: string;
  rm: string;
  registeredAt: string;
  surveyed: boolean;
}

export function PatientReportPage() {
  const { specialty } = useParams<{ specialty: string }>();
  const navigate = useNavigate();
  const specData = specialty ? specialtyAuditData[specialty as keyof typeof specialtyAuditData] : null;
  const diseases = specData?.diseases || [];


  // --- THE PREFIX + ID FIX ---
  const sessionStr = sessionStorage.getItem("persi_hospital_session") || sessionStorage.getItem("hospitalAuth");
  
  // 1. Parse the raw session object
  const rawSession = sessionStr ? JSON.parse(sessionStr) : {};

  // 2. THE CRITICAL FIX: Extract the nested 'data' object! 
  // If rawSession.data exists (new login), use it. Otherwise, fallback to rawSession (legacy).
  const currentHospital = rawSession.data || rawSession;

  const realHospitalName = currentHospital.hospitalName || currentHospital.hospital_name || "Unknown Hospital";
  
  // 1. Extract up to the first 2 words (e.g., "RSUD Sleman", "RS Paru") and format with hyphen
  const nameParts = realHospitalName.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
  const shortName = nameParts.slice(0, 2).join('-').toUpperCase() || "HOS";
  
  // 2. Strip out the annoying "hosp-" string from the database ID
  const cleanId = currentHospital?.id ? String(currentHospital.id).replace('hosp-', '') : '';

  // 3. Combine into the clean format: RSUD-SLEMAN-1776679507569
  const hospitalCode = cleanId 
    ? `${shortName}-${cleanId}` 
    : currentHospital?.email
      ? `${shortName}-${currentHospital.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`
      : `${shortName}-001`;

  const [activeDiseaseIndex, setActiveDiseaseIndex] = useState(0);
  const activeDisease = diseases[activeDiseaseIndex];

  // Use disease-specific key suffix for API calls
  const diseaseSpecialtyKey = `${specialty}-d${activeDiseaseIndex}`;

  // ---> NEW: Get the draftId using a unique variable name to avoid collisions
  const currentDraftId = draftManager.getCurrentDraftId() || "unknown-draft";

  const [surveyResponses, setSurveyResponses] = useState<PatientSurveyResponse[]>([]);
  const [registeredPatients, setRegisteredPatients] = useState<RegisteredPatient[]>([]);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showQRModal, setShowQRModal] = useState<RegisteredPatient | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<PatientSurveyResponse | null>(null);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientRM, setNewPatientRM] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [draftSavedMsg, setDraftSavedMsg] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Custom hospital survey upload
  const [customSurveyUploaded, setCustomSurveyUploaded] = useState(false);
  const [customSurveyFileName, setCustomSurveyFileName] = useState<string>("");
  const [customSurveyPatientCount, setCustomSurveyPatientCount] = useState<number>(0);

  // ---> THE FIX: Bind the PDF storage slot strictly to the current draft
  const customSurveyKey = `custom-survey-${currentDraftId}-${hospitalCode}-${diseaseSpecialtyKey}`;

  // Load existing custom survey upload from localStorage on mount & disease change
  useEffect(() => {
    const existing = localStorage.getItem(customSurveyKey);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        setCustomSurveyFileName(parsed.fileName || "");
        setCustomSurveyPatientCount(parsed.patientCount || 30);
        setCustomSurveyUploaded(true);
      } catch { }
    } else {
      setCustomSurveyFileName("");
      setCustomSurveyPatientCount(0);
      setCustomSurveyUploaded(false);
    }
  }, [customSurveyKey]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB. Vercel LocalStorage memiliki kuota yang terbatas.");
      e.target.value = ""; // Reset input cache
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Hanya format PDF yang diperbolehkan");
      e.target.value = ""; // Reset input cache
      return;
    }

    const countStr = prompt("Berapa jumlah pasien yang disurvei dalam dokumen PDF ini?\n(Kosongkan atau isi 0 jika tidak tahu/ingin menggunakan kombinasi dengan QR Code)", "0");
    if (countStr === null) {
      e.target.value = ""; // Reset if user clicks Cancel
      return;
    }
    
    const count = parseInt(countStr, 10);
    if (isNaN(count) || count < 0) {
      alert("Jumlah pasien tidak valid.");
      e.target.value = ""; // Reset input cache
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const doc = {
        fileName: file.name,
        base64,
        patientCount: Math.min(count, 30),
        uploadedAt: new Date().toISOString(),
        hospitalCode,
        realHospitalName,
        
        // FIX: Save the display name (e.g. "Kardiologi") instead of the URL slug 
        // so it perfectly matches what the Admin Review filter expects!
        specialty: specData?.name || specialty, 
        
        diseaseName: activeDisease?.diseaseName || ""
      };

      try {
        localStorage.setItem(customSurveyKey, JSON.stringify(doc));
        setCustomSurveyFileName(file.name);
        setCustomSurveyPatientCount(doc.patientCount);
        setCustomSurveyUploaded(true);
        alert(`File PDF survei internal untuk jenis penyakit ${activeDisease?.diseaseName} berhasil diunggah!`);
      } catch (err) {
        alert("Gagal mengunggah file. Mungkin ukuran terlalu besar (Storage Penuh/Melebihi Kuota).");
      }
      
      e.target.value = ""; // Reset input cache for future uploads
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveFile = () => {
    localStorage.removeItem(customSurveyKey);
    setCustomSurveyFileName("");
    setCustomSurveyPatientCount(0);
    setCustomSurveyUploaded(false);
  };

  const targetPatientCount = 30;
  // Range-based validity weight (fair scoring)
  // 1-5  patients = 80% validity,  6-10 = 85%, 11-20 = 92%, 21-30 = 100%
  const getSampleValidityWeight = (count: number): number => {
    if (count <= 0) return 0;
    if (count <= 5) return 0.80;
    if (count <= 10) return 0.85;
    if (count <= 20) return 0.92;
    return 1.0;
  };
  const getSampleLabel = (count: number): string => {
    if (count <= 0) return "Belum ada pasien";
    if (count <= 5) return "Sampel Minimal (80%)";
    if (count <= 10) return "Sampel Cukup (85%)";
    if (count <= 20) return "Sampel Baik (92%)";
    return "Sampel Lengkap (100%)";
  };

  // Load registered patients from server
  const loadRegisteredPatients = useCallback(async () => {
    if (!specialty) return;
    try {
      const patients = await api.getPatients(hospitalCode, diseaseSpecialtyKey);
      setRegisteredPatients(patients as unknown as RegisteredPatient[]);
    } catch (err) {
      console.error("Failed to load patients:", err);
    }
  }, [hospitalCode, diseaseSpecialtyKey, specialty]);

  // Load survey responses from server
  const loadResponses = useCallback(async () => {
    if (!specialty) return;
    try {
      const surveys = await api.getSurveys(hospitalCode, diseaseSpecialtyKey);
      setSurveyResponses(surveys as unknown as PatientSurveyResponse[]);
    } catch (err) {
      console.error("Failed to load surveys:", err);
    }
  }, [hospitalCode, diseaseSpecialtyKey, specialty]);

  // Initial load and on disease tab change
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        if (!realHospitalName || !specialty) {
          return;
        }
        await Promise.all([loadRegisteredPatients(), loadResponses()]);
      } catch (error) {
        console.error("Failed to fetch patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();

    // THE FIX: ADD THIS ARRAY AT THE VERY END OF THE USE-EFFECT!
    // This tells React: "ONLY run this fetch ONCE when the page loads, or if the hospital changes."
  }, [realHospitalName, specialty, loadRegisteredPatients, loadResponses]);

  // Auto-refresh every 3 seconds
  useEffect(() => {
    // Safety guard to avoid polling on uninitialized data
    if (!realHospitalName || !specialty) return;

    const interval = setInterval(() => {
      loadResponses();
      loadRegisteredPatients();
    }, 3000);
    return () => clearInterval(interval);
  }, [realHospitalName, specialty, loadRegisteredPatients, loadResponses]);

  // Mark registered patients that already have surveys
  const patientsWithStatus = registeredPatients.map(p => {
    const response = surveyResponses.find(
      r => r.medicalRecordNumber === p.rm && r.patientName === p.name
    );
    return {
      ...p,
      surveyed: !!response,
      surveyResponse: response || null,
    };
  });

  // Calculate aggregated scores
  const patientCount = surveyResponses.length + (customSurveyUploaded ? customSurveyPatientCount : 0);

  const avgPremScore = customSurveyUploaded
    ? 0 // Menunggu Review
    : surveyResponses.length > 0
      ? Math.round(surveyResponses.reduce((s, r) => s + r.premScore, 0) / surveyResponses.length)
      : 0;

  const avgPromScore = customSurveyUploaded
    ? 0 // Menunggu Review
    : surveyResponses.length > 0
      ? Math.round(surveyResponses.reduce((s, r) => s + r.promScore, 0) / surveyResponses.length)
      : 0;

  const overallScore = customSurveyUploaded
    ? 0 // Menunggu Review
    : surveyResponses.length > 0
      ? Math.round(surveyResponses.reduce((s, r) => s + r.overallScore, 0) / surveyResponses.length)
      : 0;

  const progress = Math.min((patientCount / targetPatientCount) * 100, 100);
  const isQRLocked = customSurveyUploaded && customSurveyPatientCount >= 30;

  // Build personalized survey URL with disease index
  const buildSurveyUrl = (patient: RegisteredPatient) => {
    const params = new URLSearchParams({
      name: patient.name,
      rm: patient.rm,
      disease: String(activeDiseaseIndex),
    });
    return `${window.location.origin}/patient-survey/${hospitalCode}/${specialty}?${params.toString()}`;
  };

  // Register new patient
  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (!newPatientName.trim() || !newPatientRM.trim()) {
      setRegisterError("Nama dan nomor rekam medis wajib diisi.");
      return;
    }

    const newPatient: RegisteredPatient = {
      id: `pat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: newPatientName.trim(),
      rm: newPatientRM.trim(),
      registeredAt: new Date().toISOString(),
      surveyed: false,
    };

    try {
      const result = await api.registerPatient(hospitalCode, diseaseSpecialtyKey, newPatient);
      if (!result.success && result.error) {
        setRegisterError(result.error);
        return;
      }
      if (result.duplicate) {
        setRegisterError("Nomor rekam medis sudah terdaftar.");
        return;
      }
      setNewPatientName("");
      setNewPatientRM("");
      setShowRegisterForm(false);
      await loadRegisteredPatients();
    } catch (err: any) {
      setRegisterError(err.message || "Gagal mendaftarkan pasien.");
    }
  };

  // Remove registered patient
  const handleRemovePatient = async (id: string) => {
    try {
      await api.removePatient(hospitalCode, diseaseSpecialtyKey, id);
      await loadRegisteredPatients();
    } catch (err) {
      console.error("Failed to remove patient:", err);
    }
  };

  const handleCopyLink = (patient: RegisteredPatient) => {
    navigator.clipboard.writeText(buildSurveyUrl(patient));
    alert(`Link survei untuk ${patient.name} telah disalin!`);
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!specialty) return;
    try {
      await api.saveDraft("patient-report", hospitalCode, specialty, {
        registeredPatients,
      });
      setDraftSavedMsg(true);
      setTimeout(() => setDraftSavedMsg(false), 3000);
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  };

  const draftId = draftManager.getCurrentDraftId();
  if (draftId && specialty) {
    draftManager.updateDraft(draftId, specialty, "patientReport", {
      data: { registeredPatients },
      patientCount: registeredPatients.length,
      completed: false,
    });
  }

  const handleContinue = async () => {
    await handleSaveDraft();

    const draftId = draftManager.getCurrentDraftId();
    if (draftId && specialty) {
      draftManager.updateDraft(draftId, specialty, "patientReport", {
        score: overallScore,
        patientCount,
        completed: true,
      });
    }

    sessionStorage.setItem(`${specialty}_patientReportScore`, overallScore.toString());
    navigate(`/siap-persi/result/${specialty}`);
  };

  const handleIsiNanti = async () => {
    await handleSaveDraft();
    const draftId = draftManager.getCurrentDraftId();
    if (draftId && specialty) {
      draftManager.updateDraft(draftId, specialty, "patientReport", {
        completed: false,
      });
    }
    navigate(`/siap-persi/result/${specialty}`);
  };

  // Get survey response for a patient (for review)
  const getPatientResponse = (patient: RegisteredPatient) => {
    return surveyResponses.find(
      r => r.medicalRecordNumber === patient.rm && r.patientName === patient.name
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#0F4C81] animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Multi-Specialty Progress */}
        <SpecialtyProgressTracker currentSpecialty={specialty || ""} currentStage="patient-report" />

        {/* Draft Saved Toast */}
        {draftSavedMsg && (
          <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Draft berhasil disimpan!</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/siap-persi/clinical-audit/${specialty}`}
            className="inline-flex items-center text-[#0F4C81] hover:underline mb-4"
          >
            &larr; Kembali ke Clinical Audit
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Patient Reported Measurement
          </h1>
          <p className="text-gray-600">
            Daftarkan pasien per penyakit, generate QR code personal, dan kumpulkan data PREM & PROM hingga mencapai target {targetPatientCount} pasien per penyakit - {specData?.name}
          </p>
        </div>

        {/* Disease Tabs */}
        {diseases.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <p className="text-sm font-semibold text-gray-600 mb-3">Pilih Penyakit untuk Survei Pasien:</p>
            <div className="flex gap-3">
              {diseases.map((disease, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveDiseaseIndex(index);
                    setShowRegisterForm(false);
                    setShowQRModal(null);
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${index === activeDiseaseIndex
                    ? "bg-[#0F4C81] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <div>{disease.diseaseName}</div>
                  <div className={`text-xs mt-1 ${index === activeDiseaseIndex ? "text-white/80" : "text-gray-500"}`}>
                    Bobot: {disease.weight}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Score Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-[#0F4C81] to-[#14B8A6] rounded-2xl p-6 text-white col-span-1 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Survei Terkumpul</h2>
                <p className="text-white/80 text-sm">{activeDisease?.diseaseName} | Target: {targetPatientCount} pasien</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold">{patientCount}</div>
                <div className="text-white/70 text-sm">/ {targetPatientCount}</div>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-white/60">
              <span>{customSurveyUploaded ? "Via Upload internal" : `${registeredPatients.length} pasien terdaftar`}</span>
              <span>{patientCount} survei masuk</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 w-fit mx-auto mb-2">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Skor PREM</p>
            {customSurveyUploaded ? (
              <p className="text-xs font-bold text-gray-400 mt-3 border border-gray-200 py-1.5 px-3 rounded bg-gray-50">Menunggu Tim Review</p>
            ) : (
              <>
                <p className="text-3xl font-bold text-[#0F4C81]">{avgPremScore}</p>
                <p className="text-xs text-gray-400">Bobot 60%</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-600 w-fit mx-auto mb-2">
              <Heart className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Skor PROM</p>
            {customSurveyUploaded ? (
              <p className="text-xs font-bold text-gray-400 mt-3 border border-gray-200 py-1.5 px-3 rounded bg-gray-50">Menunggu Tim Review</p>
            ) : (
              <>
                <p className="text-3xl font-bold text-[#14B8A6]">{avgPromScore}</p>
                <p className="text-xs text-gray-400">Bobot 40%</p>
              </>
            )}
          </div>
        </div>

        {/* Scoring Range Info for Patient Report */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Bobot Validitas Berdasarkan Jumlah Survei</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { range: "1–5 Pasien", pct: "80%", color: patientCount >= 1 && patientCount <= 5 ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 border border-amber-200" },
              { range: "6–10 Pasien", pct: "85%", color: patientCount >= 6 && patientCount <= 10 ? "bg-yellow-500 text-white" : "bg-yellow-50 text-yellow-700 border border-yellow-200" },
              { range: "11–20 Pasien", pct: "92%", color: patientCount >= 11 && patientCount <= 20 ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-700 border border-blue-200" },
              { range: "21–30 Pasien", pct: "100%", color: patientCount >= 21 ? "bg-green-500 text-white" : "bg-green-50 text-green-700 border border-green-200" },
            ].map((tier) => (
              <div key={tier.range} className={`rounded-lg px-3 py-2.5 text-center transition-all ${tier.color}`}>
                <p className="font-bold text-sm">{tier.pct}</p>
                <p className="text-xs mt-0.5">{tier.range}</p>
              </div>
            ))}
          </div>
          {patientCount > 0 && (
            <p className="text-xs text-center text-gray-500 mt-3">
              ✓ Bobot validitas saat ini: <strong>{(getSampleValidityWeight(patientCount) * 100).toFixed(0)}%</strong> — {getSampleLabel(patientCount)}
            </p>
          )}
        </div>

        {/* ========== CUSTOM SURVEY UPLOAD SECTION ========== */}
        <div className="bg-white rounded-2xl border-2 border-[#14B8A6]/30 p-6 md:p-8 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileUp className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Upload Hasil Survei Internal (Opsional)
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Jika rumah sakit Anda sudah memiliki hasil laporan PDF survei PREM/PROM internal khusus <strong>{activeDisease?.diseaseName}</strong>, Anda dapat mengunggahnya secara mandiri (Maks 2MB).
              </p>
            </div>
          </div>

          <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-5">
            {customSurveyUploaded ? (
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-teal-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 shadow-sm bg-teal-100 rounded-lg">
                    <FileText className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{customSurveyFileName}</h4>
                    <p className="text-xs text-green-600 font-medium tracking-wide">✓ Tersimpan (Khusus tab {activeDisease?.diseaseName})</p>
                  </div>
                </div>
                <Button
                  onClick={handleRemoveFile}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Hapus File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-teal-300 rounded-xl p-8 bg-white transition-colors hover:bg-teal-50/60">
                <UploadCloud className="w-10 h-10 text-teal-500 mb-3" />
                <p className="font-semibold text-gray-700 mb-1">Pilih file PDF laporan survei Anda</p>
                <p className="text-xs text-gray-500 mb-4 font-mono">Format: .pdf (Maksimal 2MB)</p>
                <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm">
                  <FileUp className="w-4 h-4 mr-2" />
                  Browse File PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* ========== PATIENT REGISTRATION SECTION ========== */}
        {!isQRLocked ? (
          <div className="bg-white rounded-2xl border-2 border-[#0F4C81] p-6 md:p-8 mb-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#0F4C81] rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Daftarkan Pasien - {activeDisease?.diseaseName}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Isi data pasien (nama & no. RM), lalu generate QR code personal. Pasien scan QR untuk mengisi survei PREM & PROM khusus penyakit ini.
                    {customSurveyUploaded && customSurveyPatientCount < 30 && (
                      <span className="block mt-1 text-teal-600 font-semibold">Anda mengunggah PDF dengan {customSurveyPatientCount} pasien. Anda bisa menambah data lewat QR di sini hingga mencapai 30 pasien.</span>
                    )}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => { setShowRegisterForm(!showRegisterForm); setRegisterError(""); }}
                className="bg-[#0F4C81] hover:bg-[#0d3d66] font-semibold shrink-0"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Tambah Pasien
              </Button>
            </div>

            {/* Registration Form */}
            {showRegisterForm && (
              <form onSubmit={handleRegisterPatient} className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                <h4 className="font-bold text-gray-900 mb-4">Data Pasien Baru - {activeDisease?.diseaseName}</h4>
                {registerError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
                    {registerError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nama Lengkap Pasien <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full h-11 px-4 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nomor Rekam Medis (RM) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newPatientRM}
                      onChange={(e) => setNewPatientRM(e.target.value)}
                      placeholder="Contoh: RM-000123"
                      className="w-full h-11 px-4 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] font-mono"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-[#0F4C81] hover:bg-[#0d3d66] font-semibold">
                    <QrCode className="w-4 h-4 mr-2" />
                    Daftar & Generate QR
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowRegisterForm(false)}>
                    Batal
                  </Button>
                </div>
              </form>
            )}

            {/* How it works */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Cara Penggunaan:</h4>
              <ol className="space-y-1.5 text-xs text-gray-700">
                <li className="flex gap-2">
                  <span className="font-bold text-[#0F4C81] shrink-0">1.</span>
                  <span>Pilih tab penyakit yang ingin disurvei, lalu klik &quot;Tambah Pasien&quot;</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-[#0F4C81] shrink-0">2.</span>
                  <span>QR Code personal akan otomatis di-generate dengan pertanyaan PREM/PROM sesuai penyakit</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-[#0F4C81] shrink-0">3.</span>
                  <span>Target optimal 30 pasien per penyakit. Minimal 1 pasien sudah dapat lanjut dengan bobot 80%.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-[#0F4C81] shrink-0">4.</span>
                  <span>Pasien mengisi survei (Puas / Cukup / Kurang), jawaban otomatis masuk ke scoring</span>
                </li>
              </ol>
            </div>

            {/* Registered Patients List */}
            {patientsWithStatus.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 text-gray-600 font-semibold">#</th>
                      <th className="text-left py-3 px-2 text-gray-600 font-semibold">Nama Pasien</th>
                      <th className="text-left py-3 px-2 text-gray-600 font-semibold">No. RM</th>
                      <th className="text-center py-3 px-2 text-gray-600 font-semibold">Status</th>
                      <th className="text-center py-3 px-2 text-gray-600 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientsWithStatus.map((p, i) => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2.5 px-2 text-gray-500">{i + 1}</td>
                        <td className="py-2.5 px-2 font-medium text-gray-900">{p.name}</td>
                        <td className="py-2.5 px-2 text-gray-600 font-mono">{p.rm}</td>
                        <td className="py-2.5 px-2 text-center">
                          {p.surveyed ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Selesai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                              Menunggu
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center justify-center gap-1">
                            {p.surveyed ? (
                              <button
                                onClick={() => {
                                  const response = getPatientResponse(p);
                                  if (response) setShowReviewModal(response);
                                }}
                                className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                                title="Lihat Hasil Survei"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setShowQRModal(p)}
                                className="p-2 rounded-lg hover:bg-blue-50 text-[#0F4C81] transition-colors"
                                title="Lihat QR Code"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleCopyLink(p)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                              title="Salin Link"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            {!p.surveyed && (
                              <button
                                onClick={() => handleRemovePatient(p.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium text-gray-500">Belum ada pasien terdaftar untuk {activeDisease?.diseaseName}</p>
                <p className="text-xs mt-1">Klik &quot;Tambah Pasien&quot; untuk memulai</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 p-6 md:p-8 mb-6 opacity-80">
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <QrCode className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Survei Digital (QR Code) Dinonaktifkan
              </h3>
              <p className="text-gray-600 max-w-lg leading-relaxed">
                Fitur pendaftaran otomatis dikunci karena Anda telah mengisi {customSurveyPatientCount} pasien via <strong>Upload PDF</strong> (Target 30 telah terpenuhi).
              </p>
              <Button
                onClick={handleRemoveFile}
                variant="outline"
                className="mt-5 border-gray-300 bg-white"
              >
                Hapus File PDF untuk Membuka QR Code
              </Button>
            </div>
          </div>
        )}

        {/* Response Table (always shown if there are QR code responses) */}
        {surveyResponses.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">
                Hasil Survei - {activeDisease?.diseaseName} ({surveyResponses.length})
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Live dari server
                </span>
                <Button
                  onClick={loadResponses}
                  variant="outline"
                  size="sm"
                  className="border-gray-300"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Refresh
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2 text-gray-600 font-semibold">#</th>
                    <th className="text-left py-3 px-2 text-gray-600 font-semibold">Nama</th>
                    <th className="text-left py-3 px-2 text-gray-600 font-semibold">No. RM</th>
                    <th className="text-center py-3 px-2 text-gray-600 font-semibold">PREM</th>
                    <th className="text-center py-3 px-2 text-gray-600 font-semibold">PROM</th>
                    <th className="text-center py-3 px-2 text-gray-600 font-semibold">Total</th>
                    <th className="text-left py-3 px-2 text-gray-600 font-semibold">Waktu</th>
                    <th className="text-center py-3 px-2 text-gray-600 font-semibold">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {surveyResponses.map((r, i) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-2 text-gray-500">{i + 1}</td>
                      <td className="py-2.5 px-2 font-medium text-gray-900">{r.patientName}</td>
                      <td className="py-2.5 px-2 text-gray-600 font-mono">{r.medicalRecordNumber}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${r.premScore >= 75 ? "bg-green-100 text-green-700" :
                          r.premScore >= 50 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>{r.premScore}</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${r.promScore >= 75 ? "bg-green-100 text-green-700" :
                          r.promScore >= 50 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>{r.promScore}</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">{r.overallScore}</span>
                      </td>
                      <td className="py-2.5 px-2 text-gray-500 text-xs">
                        {new Date(r.submittedAt).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => setShowReviewModal(r)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-[#0F4C81] transition-colors"
                          title="Lihat Detail Jawaban"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Average Row */}
            <div className="mt-4 bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <span className="font-bold text-gray-700">Rata-rata Skor:</span>
              <div className="flex gap-6 text-sm">
                <span>PREM: <strong className="text-[#0F4C81]">{avgPremScore}</strong></span>
                <span>PROM: <strong className="text-[#14B8A6]">{avgPromScore}</strong></span>
                <span>Total: <strong className="text-gray-900 text-lg">{overallScore}</strong>/100</span>
              </div>
            </div>
          </div>
        )}

        {/* Demo Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">Demo: Simulasi Data Pasien - {activeDisease?.diseaseName}</h3>
          <p className="text-gray-700 text-sm mb-4">
            Untuk demo, klik tombol di bawah untuk menambahkan data survei simulasi ke server.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={async () => {
                const surveys = generateSimulationSurveys(specialty || "", activeDiseaseIndex, 5);
                await api.bulkAddSurveys(hospitalCode, diseaseSpecialtyKey, surveys);
                loadResponses();
              }}
              variant="outline"
              className="border-yellow-400 bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            >
              + 5 Pasien Simulasi
            </Button>
            <Button
              onClick={async () => {
                const surveys = generateSimulationSurveys(specialty || "", activeDiseaseIndex, 30);
                await api.bulkAddSurveys(hospitalCode, diseaseSpecialtyKey, surveys);
                loadResponses();
              }}
              variant="outline"
              className="border-yellow-400 bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            >
              + 30 Pasien Simulasi
            </Button>
            <Button
              onClick={async () => {
                await api.resetSurveys(hospitalCode, diseaseSpecialtyKey);
                loadResponses();
              }}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Reset Data Penyakit Ini
            </Button>
          </div>
        </div>

        {/* Weighted Score Summary Table */}
        <div className="bg-white rounded-xl border-2 border-[#0F4C81] p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Skor PRM - {activeDisease?.diseaseName} (Berbobot)</h3>

          {customSurveyUploaded ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="font-bold text-yellow-800 text-lg mb-2">Nilai Menunggu Tim Review Pusat</p>
              <p className="text-yellow-700 text-sm">
                File survei mandiri (berisi {customSurveyPatientCount} pasien) telah diunggah. Tim validator nasional NHR PERSI akan meninjau dokumen PDF tersebut dan memberikan penilaian akhir secara manual ke dalam dashboard.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#0F4C81]">
                      <th className="text-left py-3 px-4 font-bold text-[#0F4C81]">Komponen</th>
                      <th className="text-center py-3 px-4 font-bold text-[#0F4C81]">Nilai</th>
                      <th className="text-center py-3 px-4 font-bold text-[#0F4C81]">Bobot</th>
                      <th className="text-center py-3 px-4 font-bold text-[#0F4C81]">Nilai Berbobot</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 bg-blue-50/50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">PREM (Patient Reported Experience)</div>
                        <div className="text-xs text-gray-500">Pengalaman pasien terhadap layanan</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-blue-700">{avgPremScore}</td>
                      <td className="py-3 px-4 text-center text-gray-600">60%</td>
                      <td className="py-3 px-4 text-center font-bold text-blue-700">{(avgPremScore * 0.6).toFixed(1)}</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-teal-50/50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">PROM (Patient Reported Outcome)</div>
                        <div className="text-xs text-gray-500">Hasil kesehatan menurut pasien</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-teal-700">{avgPromScore}</td>
                      <td className="py-3 px-4 text-center text-gray-600">40%</td>
                      <td className="py-3 px-4 text-center font-bold text-teal-700">{(avgPromScore * 0.4).toFixed(1)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#0F4C81]/10">
                      <td className="py-3 px-4 font-bold text-[#0F4C81] text-lg" colSpan={3}>Total PRM</td>
                      <td className="py-3 px-4 text-center font-bold text-[#0F4C81] text-2xl">{overallScore}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                <p><strong>Rumus:</strong> Total PRM = (PREM x 60%) + (PROM x 40%)</p>
                <p className="mt-1">Berdasarkan {patientCount} survei pasien {activeDisease?.diseaseName} yang telah terkumpul.</p>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            onClick={(e) => { e.preventDefault(); handleSaveDraft(); }}
            variant="outline"
            className="h-12 px-8 border-2 border-gray-300 font-semibold"
          >
            <Save className="w-5 h-5 mr-2" />
            Simpan Draft
          </Button>

          <Button
            type="button"
            onClick={(e) => { e.preventDefault(); handleIsiNanti(); }}
            variant="outline"
            className="h-12 px-8 border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-semibold"
          >
            Isi Nanti (Lanjut ke Review)
          </Button>

          <Button
            type="button"
            onClick={handleContinue}
            disabled={patientCount < 1}
            className="flex-1 h-12 bg-[#0F4C81] hover:bg-[#0d3d66] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {patientCount < 1
              ? `Daftarkan minimal 1 pasien untuk melanjutkan`
              : `Lanjut ke Hasil Akhir (Skor: ${overallScore})`}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Info:</strong> Data tersimpan di server dan auto-refresh setiap 3 detik. Setiap penyakit memiliki daftar pasien terpisah (masing-masing 30 pasien).
            Klik ikon <Eye className="w-3.5 h-3.5 inline" /> untuk review jawaban (read-only).
          </p>
        </div>
      </div>

      {/* QR Code Modal for specific patient */}
      {showQRModal && (
        <PatientQRModal
          patient={showQRModal}
          surveyUrl={buildSurveyUrl(showQRModal)}
          hospitalName={realHospitalName}
          specialtyName={specData?.name || ""}
          diseaseName={activeDisease?.diseaseName || ""}
          onClose={() => setShowQRModal(null)}
        />
      )}

      {/* Review Survey Response Modal (read-only) */}
      {showReviewModal && (
        <SurveyReviewModal
          response={showReviewModal}
          specialty={specialty || ""}
          diseaseIndex={activeDiseaseIndex}
          onClose={() => setShowReviewModal(null)}
        />
      )}
    </div>
  );
}

// ===== Survey Review Modal (Read-Only) =====
function SurveyReviewModal({
  response,
  specialty,
  diseaseIndex,
  onClose,
}: {
  response: PatientSurveyResponse;
  specialty: string;
  diseaseIndex: number;
  onClose: () => void;
}) {
  const specData = specialtyAuditData[specialty as keyof typeof specialtyAuditData];
  const disease = specData?.diseases[diseaseIndex];
  const premQuestions = disease?.premQuestions || [];
  const promQuestions = disease?.promQuestions || [];

  const getLabelColor = (value: string) => {
    if (value === "puas") return { label: "Puas", emoji: "\u{1F60A}", bg: "bg-green-100", text: "text-green-700", border: "border-green-300" };
    if (value === "cukup") return { label: "Cukup", emoji: "\u{1F610}", bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" };
    return { label: "Kurang", emoji: "\u{1F61E}", bg: "bg-red-100", text: "text-red-700", border: "border-red-300" };
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#0F4C81] rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Review Hasil Survei</h2>
              <p className="text-xs text-gray-500">{disease?.diseaseName} - Data bersifat read-only</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{response.patientName}</p>
              <p className="text-xs text-gray-500 font-mono">RM: {response.medicalRecordNumber}</p>
            </div>
            <div className="ml-auto flex gap-3 text-center">
              <div>
                <p className="text-xs text-gray-500">PREM</p>
                <p className={`text-lg font-bold ${response.premScore >= 75 ? "text-green-600" : response.premScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                  {response.premScore}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">PROM</p>
                <p className={`text-lg font-bold ${response.promScore >= 75 ? "text-green-600" : response.promScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                  {response.promScore}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-[#0F4C81]">{response.overallScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              PREM - Pengalaman Pasien
            </h3>
            <div className="space-y-2">
              {premQuestions.map((q, i) => {
                const answer = response.answers[q.id];
                const style = answer ? getLabelColor(answer) : null;
                return (
                  <div key={q.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{q.question}</p>
                    </div>
                    {style ? (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} border ${style.border} flex-shrink-0`}>
                        <span>{style.emoji}</span> {style.label}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Tidak dijawab</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-teal-600" />
              PROM - Hasil Kesehatan Pasien
            </h3>
            <div className="space-y-2">
              {promQuestions.map((q, i) => {
                const answer = response.answers[q.id];
                const style = answer ? getLabelColor(answer) : null;
                return (
                  <div key={q.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{q.question}</p>
                    </div>
                    {style ? (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} border ${style.border} flex-shrink-0`}>
                        <span>{style.emoji}</span> {style.label}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Tidak dijawab</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
            Diisi pada: {new Date(response.submittedAt).toLocaleString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== QR Code Modal for a specific patient =====
function PatientQRModal({
  patient,
  surveyUrl,
  hospitalName,
  specialtyName,
  diseaseName,
  onClose,
}: {
  patient: RegisteredPatient;
  surveyUrl: string;
  hospitalName: string;
  specialtyName: string;
  diseaseName: string;
  onClose: () => void;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(surveyUrl);
    alert("Link survei telah disalin ke clipboard!");
  };

  const handleDownload = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(surveyUrl)}&color=0F4C81&bgcolor=ffffff&margin=20&format=png`;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 920;
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 600, 920);

      ctx.fillStyle = "#0F4C81";
      ctx.fillRect(0, 0, 600, 70);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Survei Kepuasan Pasien", 300, 45);

      ctx.drawImage(img, 100, 100, 400, 400);

      ctx.fillStyle = "#0F4C81";
      ctx.font = "bold 20px Arial";
      ctx.fillText(patient.name, 300, 560);

      ctx.fillStyle = "#666666";
      ctx.font = "16px Arial";
      ctx.fillText("No. RM: " + patient.rm, 300, 590);

      ctx.fillStyle = "#333333";
      ctx.font = "18px Arial";
      ctx.fillText(hospitalName, 300, 640);

      ctx.fillStyle = "#14B8A6";
      ctx.font = "16px Arial";
      ctx.fillText(specialtyName + " - " + diseaseName, 300, 670);

      ctx.fillStyle = "#888888";
      ctx.font = "14px Arial";
      ctx.fillText("Scan QR Code di atas untuk mengisi survei", 300, 720);
      ctx.fillText("Penilaian: Puas | Cukup | Kurang", 300, 745);

      ctx.fillStyle = "#0F4C81";
      ctx.fillRect(0, 850, 600, 70);
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText("PERSI National Hospital Ranking Indonesia", 300, 880);
      ctx.fillText("NHR PERSI Assessment", 300, 900);

      const link = document.createElement("a");
      link.download = `QR-${patient.name}-${patient.rm}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = qrUrl;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-10 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>

        <h2 className="text-xl font-bold text-[#0F4C81] mb-1">
          QR Code Survei Personal
        </h2>
        <p className="text-gray-500 mb-1 text-sm">{hospitalName} - {specialtyName}</p>
        <p className="text-xs text-teal-600 font-medium mb-3">{diseaseName}</p>

        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-5">
          <span className="font-semibold text-gray-900 text-sm">{patient.name}</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600 text-sm font-mono">{patient.rm}</span>
        </div>

        <div className="inline-block bg-white rounded-2xl border-4 border-[#0F4C81] p-5 mb-5">
          <QRCodeDisplay value={surveyUrl} size={240} fgColor="#0F4C81" />
        </div>

        <p className="text-gray-500 text-xs mb-4 max-w-sm mx-auto break-all leading-relaxed">
          {surveyUrl}
        </p>

        <div className="flex items-center justify-center gap-3 text-sm mb-6">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">Puas</span>
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">Cukup</span>
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">Kurang</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleDownload}
            className="h-11 bg-[#0F4C81] hover:bg-[#0d3d66] font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="h-11 border-2 border-[#0F4C81] text-[#0F4C81] font-semibold"
          >
            <Copy className="w-4 h-4 mr-2" />
            Salin Link
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-5">
          QR Code ini khusus untuk <strong>{patient.name}</strong> - {diseaseName}
        </p>
      </div>
    </div>
  );
}

// ===== Simulation Helper =====
function generateSimulationSurveys(specialty: string, diseaseIndex: number, count: number): PatientSurveyResponse[] {
  const scoreMap: Record<string, number> = { puas: 100, cukup: 50, kurang: 0 };

  const firstNames = ["Budi", "Siti", "Agus", "Dewi", "Andi", "Rina", "Joko", "Sri", "Heru", "Yuni", "Dimas", "Putri", "Wahyu", "Lina", "Rudi"];
  const lastNames = ["Santoso", "Wibowo", "Kusuma", "Hartono", "Sari", "Purnama", "Wijaya", "Rahayu", "Pratama", "Andini", "Hidayat", "Utami"];

  const specData = specialtyAuditData[specialty as keyof typeof specialtyAuditData];
  const disease = specData?.diseases[diseaseIndex];
  const premQIds = disease?.premQuestions?.map(q => q.id) || ["prem-1", "prem-2", "prem-3", "prem-4"];
  const promQIds = disease?.promQuestions?.map(q => q.id) || ["prom-1", "prom-2", "prom-3"];

  const surveys: PatientSurveyResponse[] = [];

  for (let i = 0; i < count; i++) {
    const answers: Record<string, string> = {};

    const weightedRandom = () => {
      const r = Math.random();
      if (r < 0.5) return "puas";
      if (r < 0.8) return "cukup";
      return "kurang";
    };

    premQIds.forEach(id => { answers[id] = weightedRandom(); });
    promQIds.forEach(id => { answers[id] = weightedRandom(); });

    const premScores = premQIds.map(id => scoreMap[answers[id]]);
    const promScores = promQIds.map(id => scoreMap[answers[id]]);
    const premAvg = Math.round(premScores.reduce((a, b) => a + b, 0) / premScores.length);
    const promAvg = Math.round(promScores.reduce((a, b) => a + b, 0) / promScores.length);
    const overall = Math.round(premAvg * 0.6 + promAvg * 0.4);

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    surveys.push({
      id: "sim-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      patientName: firstName + " " + lastName,
      medicalRecordNumber: "RM-" + String(i + 1).padStart(6, "0"),
      specialty,
      answers,
      premScore: premAvg,
      promScore: promAvg,
      overallScore: overall,
      submittedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    });
  }

  return surveys;
}
