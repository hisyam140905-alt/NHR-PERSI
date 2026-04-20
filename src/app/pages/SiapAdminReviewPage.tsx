import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  CheckCircle2,
  XCircle,
  Building2,
  Trophy,
  ArrowLeft,
  FileText,
  ExternalLink,
  Clock
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { useData } from "../context/DataContext";
import { specialtyAuditData } from "../data/specialtyAuditData";

// Type for uploaded custom survey document
interface CustomSurveyDoc {
  fileName: string;
  base64: string;
  uploadedAt: string;
  hospitalCode: string;
  hospitalName: string;
  specialty: string;
  diseaseName: string;
}

export function SiapAdminReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | "">("");
  const [customSurveyDocs, setCustomSurveyDocs] = useState<CustomSurveyDoc[]>([]);
  const [activeTab, setActiveTab] = useState<"summary" | "rsbk" | "audit" | "prm">("summary");

  // Load all custom survey PDFs from localStorage (all hospitals, all specialties)
  useEffect(() => {
    const docs: CustomSurveyDoc[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("custom-survey-")) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw) as CustomSurveyDoc;
            docs.push(parsed);
          }
        } catch { }
      }
    }
    setCustomSurveyDocs(docs);
  }, []);

  const { submissions, approveSubmission, rejectSubmission } = useData();

  // Submission data will be loaded from context
  const actualSubmission = submissions.find(s => s.id === id);

  // Helper to map Indonesian name to technical key
  const getSpecialtyKey = (name: string) => {
    return Object.keys(specialtyAuditData).find(
      key => specialtyAuditData[key].name === name
    ) || "cardiology";
  };

  const submissionData = actualSubmission ? {
    ...actualSubmission,
    specialtyKey: getSpecialtyKey(actualSubmission.specialty),
  } : {
    id: id || "—",
    hospitalName: "Memuat...",
    specialty: "—",
    specialtyKey: "cardiology",
    submittedDate: "—",
    picName: "—",
    status: "Pending",
    scores: { rsbk: 0, clinicalAudit: 0, patientReport: 0, final: 0 },
    details: {}
  };



  const radarData = [
    { category: "Hospital Structure", value: submissionData.scores.rsbk as number },
    { category: "Clinical Audit", value: submissionData.scores.clinicalAudit as number },
    { category: "Patient Report", value: submissionData.scores.patientReport as number },
  ];

  const getTier = (score: number) => {
    if (score >= 90) return { grade: "Tier 1", name: "Platinum", color: "text-purple-700", bg: "bg-purple-100" };
    if (score >= 80) return { grade: "Tier 2", name: "Outstanding", color: "text-blue-700", bg: "bg-blue-100" };
    if (score >= 70) return { grade: "Tier 3", name: "Excellent", color: "text-emerald-700", bg: "bg-emerald-100" };
    if (score >= 60) return { grade: "Tier 4", name: "Commendable", color: "text-amber-700", bg: "bg-amber-100" };
    return { grade: "Tier 5", name: "Developing", color: "text-slate-600", bg: "bg-gray-100" };
  };

  const gradeInfo = getTier(submissionData.scores.final as number);

  const handleAction = (actionType: "approve" | "reject") => {
    setAction(actionType);
    setShowApprovalDialog(true);
  };

  const confirmAction = async () => {
    if (action === "approve") {
      await approveSubmission(submissionData);
    } else if (action === "reject") {
      await rejectSubmission(submissionData.id);
    }
    console.log(`${action} submission with comment:`, comment);
    setShowApprovalDialog(false);

    // Success feedback and navigate back
    setTimeout(() => {
      navigate("/siap-persi/admin/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/siap-persi/admin/dashboard"
            className="inline-flex items-center text-[#0F4C81] hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Review Submission
          </h1>
          <p className="text-gray-600">
            Detail assessment dan data yang disubmit oleh rumah sakit
          </p>
        </div>

        {/* Hospital Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {submissionData.hospitalName}
                  </h2>
                  <p className="text-gray-600">{submissionData.specialty}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Submission ID</span>
                  <span className="font-semibold font-mono text-gray-900">
                    {submissionData.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Penanggung Jawab</span>
                  <span className="font-semibold text-gray-900">
                    {/* THE FIX: Check for both spellings and add a fallback */}
                    {submissionData.picName || (submissionData as any).pic_name || "Tidak Diketahui"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal Submit</span>
                  <span className="font-semibold text-gray-900">
                    {submissionData.submittedDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0F4C81] to-[#14B8A6] rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6" />
                <h3 className="text-xl font-bold">Final Score</h3>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-bold">{submissionData.scores.final as number}</span>
                <div className={`${gradeInfo.bg} rounded-xl px-4 py-2 text-center`}>
                  <div className={`text-3xl font-bold ${gradeInfo.color}`}>
                    {gradeInfo.grade}
                  </div>
                  <div className={`text-xs font-semibold ${gradeInfo.color} uppercase tracking-wider`}>
                    {gradeInfo.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 mb-8 overflow-x-auto w-full mx-auto shadow-sm gap-1">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-6 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === "summary" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            Ringkasan Penilaian
          </button>
          <button
            onClick={() => setActiveTab("rsbk")}
            className={`px-6 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === "rsbk" ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            Hospital Structure (RSBK)
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-6 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === "audit" ? "bg-teal-50 text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            Clinical Audit
          </button>
          <button
            onClick={() => setActiveTab("prm")}
            className={`px-6 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === "prm" ? "bg-purple-50 text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            Patient Report (PRM)
          </button>
        </div>

        {/* --- TAB CONTENT: SUMMARY --- */}
        {activeTab === "summary" && (
          <div className="grid md:grid-cols-2 gap-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Component Scores */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Component Scores
              </h3>
              <div className="space-y-4">
                <ScoreRow
                  label="Hospital Structure"
                  score={submissionData.scores.rsbk as number}
                  weight="15%"
                  weighted={((submissionData.scores.rsbk as number) * 0.15).toFixed(1)}
                  color="blue"
                />
                <ScoreRow
                  label="Clinical Audit"
                  score={submissionData.scores.clinicalAudit as number}
                  weight="60%"
                  weighted={((submissionData.scores.clinicalAudit as number) * 0.6).toFixed(1)}
                  color="purple"
                />
                <ScoreRow
                  label="Patient Report"
                  score={submissionData.scores.patientReport as number}
                  weight="25%"
                  weighted={((submissionData.scores.patientReport as number) * 0.25).toFixed(1)}
                  color="teal"
                />
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Visualisasi Komponen
              </h3>
              <div className="space-y-4">
                {radarData.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm font-bold text-gray-900">{item.value as number}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-[#14B8A6] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: HOSPITAL STRUCTURE (RSBK) --- */}
        {activeTab === "rsbk" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">
              Hospital Structure Detail (RSBK)
            </h3>

            <div className="space-y-8">
              {/* SDM */}
              <div>
                <h4 className="font-extrabold text-[#0F4C81] mb-5 flex items-center gap-3 text-lg">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-200"></div>
                  Sumber Daya Manusia (SDM)
                </h4>
                <div className="grid gap-3">
                  {(() => {
                    const specData = specialtyAuditData[(submissionData as any).specialtyKey] || specialtyAuditData.cardiology;
                    const items = specData.rsbkItems.filter(i => i.category === "sdm");
                    const data = (submissionData as any).details?.rsbkData || {};

                    if (Object.keys(data).length === 0) return <p className="text-amber-600 text-sm italic">Data detail input kuesioner tidak ditemukan untuk submission lama ini.</p>;

                    return items.map(item => {
                      const val = data[item.id] || "0";
                      return (
                        <ParameterRow
                          key={item.id}
                          item={{
                            name: item.name,
                            value: val,
                            score: parseInt(val) * item.pointPerUnit,
                            detail: `${val} ${item.inputUnit || "orang"}`,
                            target: item.target
                          }}
                        />
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Sarana Prasarana */}
              <div>
                <h4 className="font-extrabold text-[#14B8A6] mb-5 flex items-center gap-3 text-lg">
                  <div className="w-3 h-3 rounded-full bg-teal-500 shadow-lg shadow-teal-200"></div>
                  Sarana & Prasarana
                </h4>
                <div className="grid gap-3">
                  {(() => {
                    const specData = specialtyAuditData[(submissionData as any).specialtyKey] || specialtyAuditData.cardiology;
                    const items = specData.rsbkItems.filter(i => i.category === "sarana");
                    const data = (submissionData as any).details?.rsbkData || {};

                    return items.map(item => {
                      const val = data[item.id] || "0";
                      return (
                        <ParameterRow
                          key={item.id}
                          item={{
                            name: item.name,
                            value: val,
                            score: parseInt(val) * item.pointPerUnit,
                            detail: `${val} ${item.inputUnit || "ruangan"}`,
                            target: item.target
                          }}
                        />
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Alat Medis */}
              <div>
                <h4 className="font-extrabold text-purple-600 mb-5 flex items-center gap-3 text-lg">
                  <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-200"></div>
                  Alat Medis
                </h4>
                <div className="grid gap-3">
                  {(() => {
                    const specData = specialtyAuditData[(submissionData as any).specialtyKey] || specialtyAuditData.cardiology;
                    const items = specData.rsbkItems.filter(i => i.category === "alat");
                    const data = (submissionData as any).details?.rsbkData || {};

                    return items.map(item => {
                      const val = data[item.id] || "0";
                      return (
                        <ParameterRow
                          key={item.id}
                          item={{
                            name: item.name,
                            value: val,
                            score: parseInt(val) * item.pointPerUnit,
                            detail: `${val} ${item.inputUnit || "unit"}`,
                            target: item.target
                          }}
                        />
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: CLINICAL AUDIT --- */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Detail Audit Klinis</h3>
            <p className="text-gray-500 text-sm mb-6 font-medium">Hasil evaluasi kepatuhan protokol klinis per item pertanyaan.</p>

            <div className="grid gap-3">
              {(() => {
                const specData = specialtyAuditData[(submissionData as any).specialtyKey] || specialtyAuditData.cardiology;
                const questions = specData.auditQuestions;
                const data = (submissionData as any).details?.auditData || {};

                if (Object.keys(data).length === 0) return <p className="text-amber-600 text-sm italic">Data rincian audit klinis tidak tersedia.</p>;

                return questions.map(q => {
                  const val = data[q.id] || "0"; // val is "1" (yes) or "2" (no)
                  return (
                    <ParameterRow
                      key={q.id}
                      item={{
                        name: q.question,
                        value: val,
                        score: val === "1" ? 100 : 0,
                        detail: val === "1" ? "Patuh / Terpenuhi" : "Tidak Terpenuhi"
                      }}
                    />
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: PATIENT REPORT (PRM) --- */}
        {activeTab === "prm" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Patient Reported Measures (PREM & PROM)</h3>
              <p className="text-gray-500 text-sm mb-8 font-medium">Laporan feedback kuesioner pengalaman dan hasil klinis pasien.</p>

              <div className="space-y-10">
                {/* PREM Section */}
                <div>
                  <h4 className="font-extrabold text-blue-600 mb-5 flex items-center gap-2 text-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    Patient Experience (PREM)
                  </h4>
                  <div className="grid gap-3">
                    {(() => {
                      const specData = specialtyAuditData[(submissionData as any).specialtyKey] || specialtyAuditData.cardiology;
                      const data = (submissionData as any).details?.prmData || {};

                      if (Object.keys(data).length === 0) return <p className="text-amber-600 text-sm italic">Data survei PREM tidak tersedia.</p>;

                      return specData.premQuestions.map(q => {
                        const val = data[q.id] || "0"; // score 0-5
                        return (
                          <ParameterRow
                            key={q.id}
                            item={{
                              name: q.question,
                              value: "1",
                              score: parseInt(val) * 20, // Normalize to 100
                              detail: `Skor Pasien: ${val}/5`
                            }}
                          />
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* PROM Section */}
                <div>
                  <h4 className="font-extrabold text-emerald-600 mb-5 flex items-center gap-2 text-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    Patient Outcome (PROM)
                  </h4>
                  <div className="grid gap-3">
                    {(() => {
                      const specData = specialtyAuditData[(submissionData as any).specialtyKey] || specialtyAuditData.cardiology;
                      const data = (submissionData as any).details?.prmData || {};

                      if (Object.keys(data).length === 0) return <p className="text-amber-600 text-sm italic">Data survei PROM tidak tersedia.</p>;

                      return specData.promQuestions.map(q => {
                        const val = data[q.id] || "0";
                        return (
                          <ParameterRow
                            key={q.id}
                            item={{
                              name: q.question,
                              value: "1",
                              score: parseInt(val) * 20, // Normalize to 100
                              detail: `Hasil Klinis: ${val}/5`
                            }}
                          />
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Survey PDF Documents */}
            <div className="bg-white rounded-xl border-2 border-indigo-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Dokumen Survei Mandiri</h3>
                  <p className="text-sm text-gray-500">Bukti survei PREM/PROM internal yang diupload oleh pihak rumah sakit</p>
                </div>
              </div>

              {customSurveyDocs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 border-2 border-dashed border-indigo-100 rounded-xl bg-indigo-50/30">
                  <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FileText className="w-7 h-7 text-indigo-300" />
                  </div>
                  <p className="font-semibold text-gray-400">Belum ada dokumen survei yang diupload</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customSurveyDocs.map((doc, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 border border-indigo-100 rounded-xl bg-indigo-50/20 hover:bg-indigo-50/40 transition-colors">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{doc.fileName}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            <Building2 className="w-3 h-3" />
                            {doc.hospitalName || doc.hospitalCode}
                          </span>
                          {doc.specialty && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                              {doc.specialty}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Upload: {new Date(doc.uploadedAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <a href={doc.base64} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors">
                          <ExternalLink className="w-4 h-4" />
                          Buka
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === ALWAYS VISIBLE BELOW TABS === */}
        {/* Admin Review Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Admin Review & Comments
          </h3>
          <Textarea
            placeholder="Masukkan catatan review atau komentar untuk rumah sakit..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-32 mb-4"
          />
          <p className="text-sm text-gray-600">
            Catatan ini akan dikirimkan ke rumah sakit bersama dengan keputusan approval.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => handleAction("reject")}
            variant="outline"
            className="h-12 px-8 border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Request Revision
          </Button>
          <Button
            onClick={() => handleAction("approve")}
            className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Approve & Publish
          </Button>
        </div>

        {/* Approval Dialog */}
        {showApprovalDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {action === "approve" ? "Approve Submission?" : "Request Revision?"}
              </h3>
              <p className="text-gray-600 mb-6">
                {action === "approve"
                  ? "Assessment ini akan dipublikasikan dan rumah sakit akan menerima notifikasi approval."
                  : "Rumah sakit akan diminta untuk melakukan revisi berdasarkan catatan yang Anda berikan."}
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalDialog(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={confirmAction}
                  className={`flex-1 ${action === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                    }`}
                >
                  Konfirmasi
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreRow({
  label,
  score,
  weight,
  weighted,
  color,
}: {
  label: string;
  score: number;
  weight: string;
  weighted: string;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">Bobot: {weight}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{score}</p>
          <p className="text-xs text-gray-500">Raw Score</p>
        </div>
        <div
          className={`${colorClasses[color as keyof typeof colorClasses]
            } px-4 py-2 rounded-lg`}
        >
          <p className="text-xl font-bold">{weighted}</p>
          <p className="text-xs opacity-75">Weighted</p>
        </div>
      </div>
    </div>
  );
}

function ParameterRow({
  item,
}: {
  // We only need the target now!
  item: { name: string; value: string; score: number; detail?: string; target?: number };
}) {
  const getValueLabel = (value: string, target?: number) => {

    // 1. THE UNRESTRICTED MATH BRAIN: If a target exists, ALWAYS do the math.
    if (target !== undefined && value !== "" && value !== undefined) {
      const numValue = Number(value);

      if (numValue >= target) {
        return { label: "Tersedia", color: "bg-emerald-100 text-emerald-700" };
      } else {
        // If it falls below the threshold, it is strictly Belum Tersedia!
        return { label: "Tidak Tersedia", color: "bg-rose-100 text-rose-700" };
      }
    }

    // 2. THE ULTIMATE FALLBACK (Just in case target is ever missing)
    if (value === "1") return { label: "Tersedia", color: "bg-emerald-100 text-emerald-700" };
    if (value === "2" || value === "0") return { label: "Tidak Tersedia", color: "bg-rose-100 text-rose-700" };

    return { label: "Sebagian", color: "bg-amber-100 text-amber-700" };
  };

  const valueInfo = getValueLabel(item.value, item.target);

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 rounded-xl transition-all group/row">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold text-gray-800 group-hover/row:text-[#0F4C81] transition-colors">{item.name}</span>
        {item.detail && (
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/row:text-gray-500">
            {item.detail}
          </span>
        )}
      </div>
      <div className="flex items-center gap-6">
        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${valueInfo.color}`}>
          {valueInfo.label}
        </span>
        <div className="text-right min-w-[60px]">
          <span className="text-lg font-black text-gray-900">{item.score}</span>
          <span className="text-[8px] block font-black text-gray-400 -mt-1 uppercase">Points</span>
        </div>
      </div>
    </div>
  );
}