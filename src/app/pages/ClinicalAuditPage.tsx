import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronRight, Save, AlertCircle, ChevronLeft, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { specialtyAuditData } from "../data/specialtyAuditData";
import { SpecialtyProgressTracker } from "../components/SpecialtyProgressTracker";
import { draftManager } from "../utils/draftManager";
import { toast } from "sonner";

// Audit compliance options
const AUDIT_OPTIONS = [
  { value: "sesuai", label: "sesuai" },
  { value: "tidak-sesuai-pengecualian", label: "tidak sesuai dengan perkecualian klinis" },
  { value: "tidak-sesuai", label: "tidak sesuai" },
];

// Scoring: sesuai = 1, tidak-sesuai-pengecualian = 1 (tetap 1, warna hijau), tidak-sesuai = 0
function getOptionScore(value: string): number {
  if (value === "sesuai") return 1;
  if (value === "tidak-sesuai-pengecualian") return 1;
  return 0;
}

// Fair range-based sample multiplier
// 1-5 rekam medis  = 80% validity weight
// 6-10 rekam medis = 85% validity weight
// 11-20 rekam medis = 92% validity weight
// 21-30 rekam medis = 100% validity weight
function getSampleValidityWeight(count: number): number {
  if (count <= 0) return 0;
  if (count <= 5) return 0.80;
  if (count <= 10) return 0.85;
  if (count <= 20) return 0.92;
  return 1.0;
}

export function ClinicalAuditPage() {
  const { specialty } = useParams<{ specialty: string }>();
  const navigate = useNavigate();
  const specialtyInfo = specialtyAuditData[specialty as keyof typeof specialtyAuditData];

  const diseases = specialtyInfo.diseases;
  const [activeDiseaseIndex, setActiveDiseaseIndex] = useState(0);
  const activeDisease = diseases[activeDiseaseIndex];

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [currentPatient, setCurrentPatient] = useState(1);


  // Load draft on mount - Robust Sync with Draft Manager
  useEffect(() => {
    const draftId = draftManager.getCurrentDraftId();
    if (draftId && specialty) {
      const draft = draftManager.getDraftById(draftId);
      
      // Ensure the clinicalAudit object exists
      if (draft && draft.progress[specialty] && draft.progress[specialty].clinicalAudit) {
        const caData = draft.progress[specialty].clinicalAudit;
        
        // 1. Restore formData
        if (caData.data && Object.keys(caData.data).length > 0) {
          setFormData(caData.data as Record<string, string>);
        }
        
        // 2. Restore current patient
        if (caData.currentPatient) {
          setCurrentPatient(caData.currentPatient);
        }

        // 3. Restore the active disease tab (This was the missing link!)
        // Note: We have to cast to any here because we added activeDiseaseIndex to the payload later
        if ((caData as any).activeDiseaseIndex !== undefined) {
            setActiveDiseaseIndex((caData as any).activeDiseaseIndex);
        }
      }
    }
  }, [specialty]); // ONLY run on mount or specialty change

  const handleChange = (patientId: number, questionId: string, value: string) => {
    setFormData({ ...formData, [`${patientId}-${questionId}`]: value });
  };

  const getCurrentPatientData = () => {
    const patientData: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      if (key.startsWith(`${currentPatient}-`)) {
        patientData[key.replace(`${currentPatient}-`, "")] = formData[key];
      }
    });
    return patientData;
  };

  // Get all questions for current disease
  const currentQuestions = activeDisease.questions;

  const calculatePatientScore = (patientNum: number) => {
    let total = 0;
    let count = 0;

    currentQuestions.forEach((q) => {
      const key = `${patientNum}-${q.id}`;
      if (formData[key]) {
        count++;
        total += getOptionScore(formData[key]);
      }
    });

    return count === currentQuestions.length
      ? Math.round((total / count) * 100)
      : null;
  };

  const calculateOverallScore = () => {
    let totalScore = 0;
    let completedPatients = 0;

    for (let i = 1; i <= 30; i++) {
      const score = calculatePatientScore(i);
      if (score !== null) {
        totalScore += score;
        completedPatients++;
      }
    }

    if (completedPatients === 0) return 0;
    const rawScore = Math.round(totalScore / completedPatients);
    const validityWeight = getSampleValidityWeight(completedPatients);
    return Math.round(rawScore * validityWeight);
  };

  const getCompletedPatientsCount = () => {
    let count = 0;
    for (let i = 1; i <= 30; i++) {
      if (calculatePatientScore(i) !== null) count++;
    }
    return count;
  };

  // --- QoL 1: Auto-Save State Interceptors ---
  const stateRef = useRef({ formData, currentPatient, activeDiseaseIndex, currentQuestions });
  const isNavigatingAwayRef = useRef(false);

  useEffect(() => {
    stateRef.current = { formData, currentPatient, activeDiseaseIndex, currentQuestions };
  }, [formData, currentPatient, activeDiseaseIndex, currentQuestions]);

  // Auto-Save on Component Unmount (Swapping stages/specialties)
  useEffect(() => {
    return () => {
      if (isNavigatingAwayRef.current) return;

      const draftId = draftManager.getCurrentDraftId();
      if (draftId && specialty) {
        const { formData: currentFormData, currentPatient: cp, activeDiseaseIndex: adi, currentQuestions: cq } = stateRef.current;
        if (Object.keys(currentFormData).length > 0) {
          
          // Re-calculate pure score based purely on captured unmount data
          let totalScore = 0;
          let completedPatients = 0;
          for (let i = 1; i <= 30; i++) {
             let total = 0;
             let count = 0;
             cq.forEach((q) => {
               const key = `${i}-${q.id}`;
               if (currentFormData[key]) { count++; total += getOptionScore(currentFormData[key]); }
             });
             const patientScore = count === cq.length ? Math.round((total / count) * 100) : null;
             if (patientScore !== null) { totalScore += patientScore; completedPatients++; }
          }
          const finalScore = completedPatients === 0 ? 0 : Math.round(Math.round(totalScore / completedPatients) * getSampleValidityWeight(completedPatients));

          draftManager.updateDraft(draftId, specialty, "clinicalAudit", {
             data: currentFormData,
             currentPatient: cp,
             activeDiseaseIndex: adi,
             score: finalScore,
             completed: false
          } as any);
        }
      }
    };
  }, [specialty]);

  // --- Adjusted Button Handlers ---
  const handleSaveDraft = (showToast = true) => {
    if (!specialty) return;
    const currentScore = calculateOverallScore(); 

    const draftId = draftManager.getCurrentDraftId();
    if (draftId) {
      draftManager.updateDraft(draftId, specialty, "clinicalAudit", {
        data: formData,
        currentPatient,
        score: currentScore,
        activeDiseaseIndex, 
        completed: false, 
      } as any); 
    }
    
    if (showToast) {
      toast.success("Draft Tersimpan", { description: "Progress Audit Klinis berhasil diamankan." });
    }
  };

  const handleNextPatient = () => {
    if (currentPatient < 30) {
      handleSaveDraft(false); // QoL: Auto-save silently on patient flip
      setCurrentPatient(currentPatient + 1);
    }
  };

  const handlePrevPatient = () => {
    if (currentPatient > 1) {
      handleSaveDraft(false); // QoL: Auto-save silently on patient flip
      setCurrentPatient(currentPatient - 1);
    }
  };

  const handleSubmit = () => {
    isNavigatingAwayRef.current = true;
    handleSaveDraft(false); 
    const score = calculateOverallScore();

    const draftId = draftManager.getCurrentDraftId();
    if (draftId && specialty) {
      draftManager.updateDraft(draftId, specialty, "clinicalAudit", {
         data: formData,
         currentPatient,
         activeDiseaseIndex,
         score: score,
         completed: true,
      } as any);
    }
    sessionStorage.setItem(`${specialty}_clinicalAuditScore`, score.toString());
    navigate(`/siap-persi/patient-report/${specialty}`);
  };

  const handleIsiNanti = () => {
    isNavigatingAwayRef.current = true;
    handleSaveDraft(false); 
    navigate(`/siap-persi/patient-report/${specialty}`);
  };

  const handleBackToPortal = () => {
    isNavigatingAwayRef.current = true;
    handleSaveDraft(false); // Silent save
    navigate("/hospital-login"); 
  };

  const currentPatientData = getCurrentPatientData();
  const completedPatients = getCompletedPatientsCount();
  const progress = (completedPatients / 30) * 100;
  const currentPatientScore = calculatePatientScore(currentPatient);

  // Calculate weighted scores per category (Diagnosa 25%, Tatalaksana 25%, Outcome 50%)
  const calculateCategoryScores = () => {
    const categories: Record<string, { total: number; count: number; weight: number }> = {};

    for (let p = 1; p <= 30; p++) {
      let patientComplete = true;
      currentQuestions.forEach((q) => {
        const key = `${p}-${q.id}`;
        if (!formData[key]) patientComplete = false;
      });
      if (!patientComplete) continue;

      currentQuestions.forEach((q) => {
        const key = `${p}-${q.id}`;
        const catName = q.category.replace(/\s*\(\d+%\)/, "");
        const weightMatch = q.category.match(/(\d+)%/);
        const weight = weightMatch ? parseInt(weightMatch[1]) / 100 : 0.25;

        if (!categories[catName]) {
          categories[catName] = { total: 0, count: 0, weight };
        }
        if (formData[key]) {
          categories[catName].total += getOptionScore(formData[key]);
          categories[catName].count++;
        }
      });
    }

    return Object.entries(categories).map(([name, data]) => ({
      name,
      score: data.count > 0 ? Math.round((data.total / data.count) * 100) : 0,
      weight: data.weight,
      weightedScore: data.count > 0 ? Number(((data.total / data.count) * 100 * data.weight).toFixed(1)) : 0,
    }));
  };

  const categoryScores = calculateCategoryScores();
  const rawWeightedAudit = Number(categoryScores.reduce((s, c) => s + c.weightedScore, 0).toFixed(1));
  const validityWeight = getSampleValidityWeight(completedPatients);
  const totalWeightedAudit = Number((rawWeightedAudit * validityWeight).toFixed(1));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Multi-Specialty Progress */}
        <SpecialtyProgressTracker currentSpecialty={specialty || ""} currentStage="clinical-audit" />

        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToPortal} 
            className="text-[#0F4C81] hover:text-[#0d3d66] hover:bg-blue-50 px-3 h-9 mb-4 -ml-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Portal RS
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Audit Klinis - {specialtyInfo.name}
              </h1>
              <p className="text-gray-600">
                {activeDisease.diseaseName} - Pasien #{currentPatient} dari 30 Rekam Medis
              </p>
            </div>
          </div>
        </div>

        {/* Disease Tabs (for specialties with multiple diseases) */}
        {diseases.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <p className="text-sm font-semibold text-gray-600 mb-3">Penyakit yang Diaudit:</p>
            <div className="flex gap-3">
              {diseases.map((disease, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveDiseaseIndex(index);
                    setCurrentPatient(1);
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

        {/* Progress Bar + Scoring Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              Progress Review Pasien — {activeDisease.diseaseName}
            </span>
            <span className="text-sm text-gray-600">
              {completedPatients} / 30 rekam medis ({progress.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Scoring Range Info */}
          <div className="grid grid-cols-4 gap-2 mt-1">
            {[
              { range: "1–5 RM", pct: "80%", desc: "Sampel Minimal", color: completedPatients >= 1 && completedPatients <= 5 ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 border border-amber-200" },
              { range: "6–10 RM", pct: "85%", desc: "Sampel Cukup", color: completedPatients >= 6 && completedPatients <= 10 ? "bg-yellow-500 text-white" : "bg-yellow-50 text-yellow-700 border border-yellow-200" },
              { range: "11–20 RM", pct: "92%", desc: "Sampel Baik", color: completedPatients >= 11 && completedPatients <= 20 ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-700 border border-blue-200" },
              { range: "21–30 RM", pct: "100%", desc: "Sampel Lengkap", color: completedPatients >= 21 ? "bg-green-500 text-white" : "bg-green-50 text-green-700 border border-green-200" },
            ].map((tier) => (
              <div key={tier.range} className={`rounded-lg px-3 py-2 text-center transition-all ${tier.color}`}>
                <p className="font-bold text-sm">{tier.pct}</p>
                <p className="font-semibold text-xs">{tier.range}</p>
                <p className="text-[10px] opacity-80">{tier.desc}</p>
              </div>
            ))}
          </div>
          {completedPatients > 0 && (
            <p className="text-xs text-center text-gray-500 mt-2">
              ✓ Skor akhir Anda = skor raw × <strong>{(getSampleValidityWeight(completedPatients) * 100).toFixed(0)}%</strong> bobot validitas ({completedPatients} rekam medis)
            </p>
          )}
        </div>

        {/* Patient Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={handlePrevPatient}
              disabled={currentPatient === 1}
              className="h-10"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Sebelumnya
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-gray-900">
                Pasien #{currentPatient}
              </span>
              {currentPatientScore !== null && (
                <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${currentPatientScore >= 80
                  ? "bg-green-50 text-green-700 border-green-200"
                  : currentPatientScore >= 50
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                  Selesai - Skor: {currentPatientScore}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleNextPatient}
              disabled={currentPatient === 30}
              className="h-10"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Quick Patient Navigation */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => {
              const isCompleted = calculatePatientScore(num) !== null;
              const isCurrent = num === currentPatient;
              return (
                <button
                  key={num}
                  onClick={() => {
                    handleSaveDraft(false); // QoL: Auto save silently when using quick grid
                    setCurrentPatient(num);
                  }}
                  className={`w-10 h-10 rounded-lg font-semibold transition-all ${isCurrent
                    ? "bg-[#0F4C81] text-white ring-2 ring-[#0F4C81] ring-offset-2"
                    : isCompleted
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 mb-1">
                Panduan Audit Klinis
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                Review rekam medis pasien secara retrospektif (minimal 1, optimal 30).
                Semakin banyak sampel, semakin tinggi bobot validitas skor audit Anda.
                Evaluasi apakah setiap indikator <strong>dilaksanakan</strong> sesuai standar protokol klinis.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap mt-0.5">sesuai</span>
                  <span className="text-gray-700">Dilaksanakan sesuai standar protokol klinis (1 poin)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap mt-0.5">tidak sesuai dengan perkecualian klinis</span>
                  <span className="text-gray-700">Tidak sesuai, namun memenuhi perkecualian klinis yang valid (tetap 1 poin)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap mt-0.5">tidak sesuai</span>
                  <span className="text-gray-700">Tidak sesuai dan tidak ada perkecualian klinis (0 poin)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Questions */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Indikator Audit - {activeDisease.diseaseName} - Pasien #{currentPatient}
            </h3>
          </div>
          <div className="space-y-4">
            {currentQuestions.map((question, index) => (
              <AuditQuestion
                key={question.id}
                number={index + 1}
                question={question.question}
                category={question.category}
                value={currentPatientData[question.id] || ""}
                onChange={(value) =>
                  handleChange(currentPatient, question.id, value)
                }
              />
            ))}
          </div>
        </div>

        {/* Weighted Score Summary Table */}
        <div className="bg-white rounded-xl border-2 border-[#0F4C81] p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Skor Audit Klinis (Berbobot)</h3>

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
                {categoryScores.map((cat, i) => {
                  const colors = ["text-blue-700 bg-blue-50/50", "text-teal-700 bg-teal-50/50", "text-purple-700 bg-purple-50/50"];
                  const colorClass = colors[i % colors.length];
                  const textColor = colorClass.split(" ")[0];
                  return (
                    <tr key={cat.name} className={`border-b border-gray-200 ${colorClass.split(" ")[1]}`}>
                      <td className="py-3 px-4 font-medium text-gray-900">{cat.name}</td>
                      <td className={`py-3 px-4 text-center font-bold ${textColor}`}>{cat.score}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{(cat.weight * 100).toFixed(0)}%</td>
                      <td className={`py-3 px-4 text-center font-bold ${textColor}`}>{cat.weightedScore}</td>
                    </tr>
                  );
                })}
                {categoryScores.length === 0 && (
                  <tr className="border-b border-gray-200">
                    <td colSpan={4} className="py-4 px-4 text-center text-gray-400 italic">
                      Selesaikan minimal 1 pasien untuk melihat skor
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[#0F4C81]/10">
                  <td className="py-3 px-4 font-bold text-[#0F4C81] text-lg" colSpan={3}>Total Audit Klinis</td>
                  <td className="py-3 px-4 text-center font-bold text-[#0F4C81] text-2xl">{totalWeightedAudit}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <p><strong>Rumus:</strong> Total = (Diagnosa x 25%) + (Tatalaksana x 25%) + (Outcome x 50%)</p>
            <p className="mt-1">Outcome memiliki bobot tertinggi karena merupakan indikator utama mutu pelayanan.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            onClick={() => handleSaveDraft()}
            variant="outline"
            className="h-12 px-8 border-2 border-gray-300 font-semibold"
          >
            <Save className="w-5 h-5 mr-2" />
            Simpan Draft
          </Button>

          {/* Skip Button */}
          <Button
            onClick={handleIsiNanti}
            variant="outline"
            className="h-12 px-8 border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-semibold"
          >
            Isi Nanti (Lanjut ke Patient Report)
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={completedPatients < 1}
            className="flex-1 h-12 bg-[#0F4C81] hover:bg-[#0d3d66] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completedPatients < 1
              ? "Isi minimal 1 rekam medis untuk melanjutkan"
              : `Lanjut ke Patient Report (${completedPatients} RM, bobot ${(getSampleValidityWeight(completedPatients) * 100).toFixed(0)}%)`}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Tips:</strong> Data audit otomatis tersimpan saat Anda klik &quot;Simpan Draft&quot;.
            Anda dapat menutup halaman dan melanjutkan nanti — semua progress akan tetap tersimpan.
          </p>
        </div>
      </div>
    </div>
  );
}

function AuditQuestion({
  number,
  question,
  category,
  value,
  onChange,
}: {
  number: number;
  question: string;
  category: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center font-bold flex-shrink-0">
          {number}
        </div>
        <div className="flex-1">
          <div className="mb-3">
            <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded mb-2">
              {category}
            </div>
            <p className="font-medium text-gray-900 leading-relaxed">{question}</p>
          </div>
          <div className="space-y-2">
            {AUDIT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${value === option.value
                  ? option.value === "sesuai"
                    ? "border-green-500 bg-green-50"
                    : option.value === "tidak-sesuai-pengecualian"
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
              >
                <input
                  type="radio"
                  name={`audit-${number}-${question}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${value === option.value
                    ? option.value === "sesuai"
                      ? "border-green-500 bg-green-500"
                      : option.value === "tidak-sesuai-pengecualian"
                        ? "border-green-500 bg-green-500"
                        : "border-red-500 bg-red-500"
                    : "border-gray-300"
                    }`}
                >
                  {value === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className={`text-sm ${value === option.value ? "font-semibold" : ""} ${option.value === "sesuai" && value === option.value
                  ? "text-green-800"
                  : option.value === "tidak-sesuai-pengecualian" && value === option.value
                    ? "text-green-800"
                    : option.value === "tidak-sesuai" && value === option.value
                      ? "text-red-800"
                      : "text-gray-700"
                  }`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}