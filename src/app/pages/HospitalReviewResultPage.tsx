import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useData } from "../context/DataContext";

export function HospitalReviewResultPage() {
  const navigate = useNavigate();
  const { currentHospital, submissions } = useData();
  const [authData, setAuthData] = useState<{ hospitalName: string; picName: string } | null>(null);

  // Check authentication on mount
  useEffect(() => {
    // THE FIX: Grab from the correct session pocket!
    const sessionStr = sessionStorage.getItem("persi_hospital_session");

    if (!sessionStr && !currentHospital) {
      navigate("/hospital-login");
      return;
    }

    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      setAuthData({
        // Safely extract the name regardless of how the database formats it
        hospitalName: parsed.hospitalName || parsed.hospital_name || "Unknown",
        picName: parsed.picName || parsed.pic_name || "Unknown",
      });
    } else if (currentHospital) {
      setAuthData({
        hospitalName: currentHospital.hospitalName,
        picName: currentHospital.picName,
      });
    }
  }, [navigate, currentHospital]);

  if (!authData) return null;

  // Get hospital's submissions
  const hospitalSubmissions = submissions.filter(
    (s) => s.hospitalName === authData.hospitalName
  );

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved") return "bg-green-100 text-green-700 border-green-200";
    if (s === "revision required") return "bg-red-100 text-red-700 border-red-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved") return <CheckCircle2 className="w-5 h-5" />;
    if (s === "revision required") return <AlertCircle className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getTier = (score: number) => {
    if (score >= 90) return { grade: "Tier 1", name: "Platinum", color: "text-purple-700", bg: "bg-purple-50" };
    if (score >= 80) return { grade: "Tier 2", name: "Outstanding", color: "text-blue-700", bg: "bg-blue-50" };
    if (score >= 70) return { grade: "Tier 3", name: "Excellent", color: "text-emerald-700", bg: "bg-emerald-50" };
    if (score >= 60) return { grade: "Tier 4", name: "Commendable", color: "text-amber-700", bg: "bg-amber-50" };
    return { grade: "Tier 5", name: "Developing", color: "text-slate-600", bg: "bg-slate-50" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/submit")}
          className="mb-6 -ml-2 text-[#0F4C81] hover:text-[#0d3d66] hover:bg-blue-100/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard Portal
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hasil Penilaian & Review</h1>
          <p className="text-gray-600">
            Pantau status dan catatan dari Tim Validator Nasional PERSI untuk submission assessment Anda.
          </p>
        </div>

        {hospitalSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Submission</h3>
            <p className="text-gray-500 mb-6">
              Anda belum mengirimkan data assessment apa pun ke sistem.
            </p>
            <Button onClick={() => navigate("/siap-persi/select-specialty")} className="bg-[#0F4C81] hover:bg-[#0d3d66]">
              Mulai Assessment Sekarang
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {hospitalSubmissions.map((submission) => {
              const gradeInfo = getTier((submission.scores?.final as number) || 0);
              const isApproved = submission.status.toLowerCase() === "approved";
              const isRevision = submission.status.toLowerCase() === "revision required";

              return (
                <div key={submission.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Status Header */}
                  <div className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 ${isApproved ? "bg-green-50/50 border-green-100" :
                    isRevision ? "bg-red-50/50 border-red-100" :
                      "bg-yellow-50/50 border-yellow-100"
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isApproved ? "bg-green-100 text-green-700" :
                        isRevision ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                        {getStatusIcon(submission.status)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{submission.specialty}</h3>
                        <p className="text-gray-600 font-mono text-xs mt-0.5">ID: {submission.id}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(submission.status)}`}>
                      Status: {submission.status}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                      {/* Score Summary */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Ringkasan Skor</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Hospital Structure (15%)</span>
                            <span className="font-bold text-gray-900">{(submission.scores?.rsbk as number) || 0}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Clinical Audit (60%)</span>
                            <span className="font-bold text-gray-900">{(submission.scores?.clinicalAudit as number) || 0}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Patient Report (25%)</span>
                            <span className="font-bold text-gray-900">{(submission.scores?.patientReport as number) || 0}</span>
                          </div>
                        </div>

                        {isApproved && (
                          <div className={`mt-5 p-4 rounded-xl flex items-center justify-between ${gradeInfo.bg}`}>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Skor Akhir</p>
                              <div className="flex items-baseline gap-2">
                                <span className={`text-3xl font-bold ${gradeInfo.color}`}>{(submission.scores?.final as number)?.toFixed(1) || 0}</span>
                                <span className={`text-sm font-bold ${gradeInfo.color}`}>/ 100</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <span className={`block text-3xl font-black ${gradeInfo.color}`}>{gradeInfo.grade}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${gradeInfo.color}`}>{gradeInfo.name}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Feedback from Admin */}
                      <div className="flex flex-col h-full">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#0F4C81]" />
                          Catatan Tim Reviewer
                        </h4>

                        <div className={`flex-1 rounded-xl p-4 border text-sm leading-relaxed ${submission.reviewerNotes
                          ? "bg-blue-50/50 border-blue-200 text-gray-800"
                          : "bg-gray-50 border-gray-100 text-gray-400 italic flex items-center justify-center text-center"
                          }`}>
                          {submission.reviewerNotes ? (
                            <div className="whitespace-pre-wrap">{submission.reviewerNotes}</div>
                          ) : (
                            <p>
                              {!isApproved && !isRevision
                                ? "Assessment Anda sedang dalam antrean review. Silakan tunggu update dari Tim Nasional NHR PERSI."
                                : "Tidak ada catatan khusus dari tim reviewer untuk submission ini."}
                            </p>
                          )}
                        </div>

                        {isRevision && (
                          <Button
                            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => {
                              navigate(`/siap-persi/select-specialty`);
                            }}
                          >
                            Perbaiki & Upload Ulang
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
