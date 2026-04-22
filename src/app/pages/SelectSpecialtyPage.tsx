import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Heart, Activity, Brain, ChevronRight, CheckCircle2, Clock, Trash2, Play, Plus, Users, Layout, MapPin, ArrowRight, Building2, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import { specialtyAuditData } from "../data/specialtyAuditData";
import { draftManager, DraftData } from "../utils/draftManager";

export function SelectSpecialtyPage() {
  const navigate = useNavigate();
  const [authData, setAuthData] = useState<{ hospitalName: string; picName: string } | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<DraftData[]>([]);
  const [showNewAssessment, setShowNewAssessment] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    // 1. Prioritize the modern session key, fallback to the old one to prevent stale data leaks
    const auth = sessionStorage.getItem("persi_hospital_session") || sessionStorage.getItem("hospitalAuth");
    if (!auth) {
      navigate("/hospital-login");
      return;
    }
    
    const parsedAuth = JSON.parse(auth);
    
    // 2. Safely extract names handling both frontend (camelCase) and backend (snake_case) formats
    const realHospitalName = parsedAuth.hospitalName || parsedAuth.hospital_name || "Unknown Hospital";
    const realPicName = parsedAuth.picName || parsedAuth.pic_name || "Unknown PIC";

    setAuthData({ hospitalName: realHospitalName, picName: realPicName });

    // 3. Initial load from local using the robust name
    const loadLocalDrafts = () => {
      const allDrafts = draftManager.getAllDrafts();
      const hospitalDrafts = allDrafts.filter(d => d.hospitalName === realHospitalName);
      setDrafts(hospitalDrafts);
    };

    loadLocalDrafts();

    // Sync with cloud and update state
    draftManager.syncWithCloud().then(() => {
      loadLocalDrafts();
    });

    // Load previously selected specialties if any
    const saved = sessionStorage.getItem("selectedSpecialties");
    if (saved) {
      setSelectedSpecialties(JSON.parse(saved));
    }
  }, [navigate]);

  const toggleSpecialty = (id: string) => {
    setSelectedSpecialties((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleStartAssessment = () => {
    if (selectedSpecialties.length === 0) {
      alert("Pilih minimal 1 pelayanan untuk memulai assessment");
      return;
    }

    if (!authData) return;

    // Create new draft
    const draft = draftManager.createDraft(
      authData.hospitalName,
      authData.picName,
      selectedSpecialties
    );

    // Save to session
    sessionStorage.setItem("selectedSpecialties", JSON.stringify(selectedSpecialties));
    draftManager.setCurrentDraftId(draft.draftId);

    // Navigate to first specialty's RSBK
    navigate(`/siap-persi/rsbk/${selectedSpecialties[0]}`);
  };

  const handleResumeDraft = (draft: DraftData) => {
    // Set draft as current
    draftManager.setCurrentDraftId(draft.draftId);
    sessionStorage.setItem("selectedSpecialties", JSON.stringify(draft.selectedSpecialties));

    // Find next incomplete stage
    const nextStage = draftManager.getNextStage(draft);

    if (nextStage) {
      // Navigate to next incomplete stage
      if (nextStage.stage === "rsbk") {
        navigate(`/siap-persi/rsbk/${nextStage.specialty}`);
      } else if (nextStage.stage === "clinicalAudit") {
        navigate(`/siap-persi/clinical-audit/${nextStage.specialty}`);
      } else {
        navigate(`/siap-persi/patient-report/${nextStage.specialty}`);
      }
    } else {
      // All completed, go to result page
      const lastSpecialty = draft.selectedSpecialties[draft.selectedSpecialties.length - 1];
      navigate(`/siap-persi/result/${lastSpecialty}`);
    }
  };

  const handleDeleteDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Apakah Anda yakin ingin menghapus draft ini?")) {
      draftManager.deleteDraft(draftId);
      setDrafts(drafts.filter(d => d.draftId !== draftId));
    }
  };

  if (!authData) {
    return null; // Loading
  }

  const specialties = [
    {
      id: "cardiology",
      name: "Cardiology",
      nameId: "Kardiologi",
      description:
        "Penilaian untuk layanan jantung dan pembuluh darah, mencakup pemeriksaan EKG, revaskularisasi, stratifikasi risiko, dan intervensi koroner",
      icon: <Heart className="w-12 h-12" />,
      color: "from-red-500 to-pink-500",
      bgLight: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-500",
      stats: {
        doctors: `${specialtyAuditData.cardiology.rsbkItems.filter(i => i.category === "sdm").length} item SDM`,
        indicators: `${specialtyAuditData.cardiology.auditQuestions.length} indikator audit`,
        equipment: `${specialtyAuditData.cardiology.rsbkItems.filter(i => i.category === "alat").length} alat medis`,
      },
    },
    {
      id: "neurology",
      name: "Neurology",
      nameId: "Neurologi",
      description:
        "Evaluasi layanan neurologi dan stroke, termasuk CT scan, pemberian trombolitik, pemeriksaan lab, dan antiplatelet/antikoagulan",
      icon: <Brain className="w-12 h-12" />,
      color: "from-blue-500 to-cyan-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-500",
      stats: {
        doctors: `${specialtyAuditData.neurology.rsbkItems.filter(i => i.category === "sdm").length} item SDM`,
        indicators: `${specialtyAuditData.neurology.auditQuestions.length} indikator audit`,
        equipment: `${specialtyAuditData.neurology.rsbkItems.filter(i => i.category === "alat").length} alat medis`,
      },
    },
    {
      id: "oncology",
      name: "Oncology",
      nameId: "Onkologi",
      description:
        "Asesmen layanan kanker komprehensif mencakup Kanker Payudara dan Kanker Serviks, dengan evaluasi SDM, sarana bertingkat (Dasar s/d Paripurna), dan audit klinis",
      icon: <Activity className="w-12 h-12" />,
      color: "from-purple-500 to-indigo-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-500",
      stats: {
        doctors: `${specialtyAuditData.oncology.rsbkItems.filter(i => i.category === "sdm").length} item SDM`,
        indicators: `${specialtyAuditData.oncology.auditQuestions.length} indikator audit (2 penyakit)`,
        equipment: `${specialtyAuditData.oncology.rsbkItems.filter(i => i.category === "alat").length} alat medis`,
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/hospital-login"
            className="inline-flex items-center text-[#0F4C81] hover:underline mb-4"
          >
            ← Kembali ke Dashboard page
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pilih Pelayanan
          </h1>
          <p className="text-gray-600 text-lg">
            Pilih satu atau lebih pelayanan yang akan dinilai untuk NHR PERSI Assessment
          </p>
        </div>

        {/* Draft List Section */}
        {drafts.length > 0 && !showNewAssessment && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Draft Tersimpan</h2>
                <p className="text-gray-600">Lanjutkan assessment yang belum selesai</p>
              </div>
              <Button
                onClick={() => setShowNewAssessment(true)}
                className="bg-[#0F4C81] hover:bg-[#0d3d66]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Buat Assessment Baru
              </Button>
            </div>

            <div className="space-y-4">
              {drafts.map((draft) => (
                <DraftCard
                  key={draft.draftId}
                  draft={draft}
                  onResume={() => handleResumeDraft(draft)}
                  onDelete={(e) => handleDeleteDraft(draft.draftId, e)}
                />
              ))}
            </div>
          </div>
        )}

        {/* New Assessment Section */}
        {(drafts.length === 0 || showNewAssessment) && (
          <>
            {showNewAssessment && (
              <div className="mb-6">
                <Button
                  onClick={() => setShowNewAssessment(false)}
                  variant="outline"
                  className="border-2"
                >
                  ← Kembali ke Draft
                </Button>
              </div>
            )}

            {/* Info Banner - Premium Design */}
            <div className="relative bg-gradient-to-br from-[#0F4C81] via-[#0F4C81] to-[#14B8A6] rounded-[2.5rem] p-10 mb-12 text-white overflow-hidden shadow-2xl shadow-blue-900/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full -ml-24 -mb-24 blur-3xl" />

              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="w-20 h-20 bg-white/15 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-xl border border-white/20">
                  <Layout className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/10">
                    <CheckCircle2 className="w-3 h-3" />
                    Feature Highlight
                  </div>
                  <h3 className="font-black text-white mb-3 text-3xl tracking-tight">
                    Sistem Multi-Pelayanan Paralel
                  </h3>
                  <p className="text-white/80 leading-relaxed max-w-2xl text-lg font-medium">
                    Efisiensi tanpa batas. Pilih beberapa pelayanan sekaligus dan selesaikan seluruh assessment dalam satu alur kerja yang terintegrasi secara otomatis.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-sm font-bold opacity-90">Bobot RSBK: 15%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-teal-400" />
                      <span className="text-sm font-bold opacity-90">Bobot Audit: 60%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-pink-400" />
                      <span className="text-sm font-bold opacity-90">Patient Report: 25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selection Counter - Floating Bar Style */}
            {selectedSpecialties.length > 0 && (
              <div className="sticky bottom-8 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="bg-[#0F4C81]/95 backdrop-blur-lg border border-white/20 rounded-[2rem] p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 max-w-4xl mx-auto ring-1 ring-black/5">
                  <div className="flex items-center gap-4 md:gap-5 md:ml-4 w-full md:w-auto">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
                      <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-extrabold text-white text-base md:text-lg">
                        {selectedSpecialties.length} Pelayanan Siap Dinilai
                      </p>
                      <p className="text-white/70 text-xs md:text-sm font-medium line-clamp-1">
                        {selectedSpecialties.map(id =>
                          specialties.find(s => s.id === id)?.nameId
                        ).join(" • ")}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleStartAssessment}
                    className="h-14 md:h-16 px-8 md:px-10 w-full md:w-auto bg-white text-[#0F4C81] hover:bg-gray-50 rounded-[1.5rem] font-bold text-base md:text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 border-none"
                  >
                    Mulai Sekarang
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3 shrink-0" />
                  </Button>
                </div>
              </div>
            )}

            {/* Specialty Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-12">
              {specialties.map((specialty) => (
                <SpecialtyCard
                  key={specialty.id}
                  specialty={specialty}
                  isSelected={selectedSpecialties.includes(specialty.id)}
                  onToggle={() => toggleSpecialty(specialty.id)}
                />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center pb-12">
              {selectedSpecialties.length === 0 && (
                <div className="inline-flex items-center gap-3 py-3 px-6 bg-white border border-gray-100 rounded-full shadow-sm text-gray-500 text-sm font-medium">
                  <Layout className="w-4 h-4 text-[#0F4C81]" />
                  Pilih pelayanan di atas untuk memulai perjalanan assessment Anda
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SpecialtyCard({
  specialty,
  isSelected,
  onToggle,
}: {
  specialty: {
    id: string;
    name: string;
    nameId: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgLight: string;
    textColor: string;
    borderColor: string;
    stats: {
      doctors: string;
      indicators: string;
      equipment: string;
    };
  };
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`group bg-white rounded-3xl border-2 overflow-hidden transition-all duration-300 text-left w-full relative flex flex-col h-full shadow-sm hover:shadow-2xl ${isSelected
        ? `${specialty.borderColor} shadow-blue-100 ring-4 ring-offset-2 ring-blue-50 -translate-y-2`
        : "border-gray-100 hover:border-gray-200"
        }`}
    >
      {/* Checkbox Indicator - Premium Style */}
      <div className="absolute top-5 right-5 z-20">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 transform ${isSelected
            ? `bg-white text-[#0F4C81] scale-110 shadow-lg`
            : "bg-white/30 backdrop-blur-md border border-white/40 text-transparent scale-100"
            }`}
        >
          <CheckCircle2 className={`w-6 h-6 ${isSelected ? "opacity-100" : "opacity-0"}`} />
        </div>
      </div>

      {/* Header with Visual Richness */}
      <div className={`relative bg-gradient-to-br ${specialty.color} p-8 text-white overflow-hidden`}>
        {/* Abstract Background Shapes */}
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-black/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />

        <div className="relative z-10">
          <div className={`${specialty.bgLight} w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-inner backdrop-blur-sm`}>
            <div className={`${specialty.textColor} transform group-hover:scale-110 transition-transform w-8 h-8 [&>svg]:w-full [&>svg]:h-full`}>
              {specialty.icon}
            </div>
          </div>
          <h3 className="text-3xl font-extrabold mb-1 tracking-tight">{specialty.nameId}</h3>
          <p className="text-white/80 font-medium tracking-wide uppercase text-xs">{specialty.name}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-1 bg-white">
        <p className="text-gray-600 text-sm leading-relaxed mb-6 opacity-90 group-hover:text-gray-900 transition-colors">
          {specialty.description}
        </p>

        <div className="mt-auto">
          {/* Dynamic Stats Grid */}
          <div className="space-y-4 mb-8">
            <StatItem
              icon={<Users className="w-4 h-4" />}
              label="Tenaga Medis"
              value={specialty.stats.doctors}
            />
            <StatItem
              icon={<Activity className="w-4 h-4" />}
              label="Indikator Audit"
              value={specialty.stats.indicators}
            />
            <StatItem
              icon={<Plus className="w-4 h-4" />}
              label="Alat Medis"
              value={specialty.stats.equipment}
            />
          </div>

          {/* Footer Interaction */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-widest ${isSelected ? specialty.textColor : "text-gray-400 group-hover:text-gray-600"} transition-colors`}>
              {isSelected ? "Terpilih" : "Belum Dipilih"}
            </span>
            <div className={`p-2 rounded-xl transition-all ${isSelected ? specialty.bgLight : "bg-gray-50 group-hover:bg-gray-100"}`}>
              <ChevronRight className={`w-5 h-5 ${isSelected ? specialty.textColor : "text-gray-400"}`} />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string; }) {
  return (
    <div className="flex items-center gap-4 group/item">
      <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center transition-colors group-hover/item:bg-white group-hover/item:shadow-sm`}>
        <div className="text-gray-400 group-hover:text-gray-600">{icon}</div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-tight">{label}</span>
          <span className="text-sm font-bold text-gray-900">{value}</span>
        </div>
        <div className="w-full bg-gray-100 h-1 rounded-full mt-1 overflow-hidden">
          <div className="bg-gray-200 h-full w-2/3 group-hover:w-full transition-all duration-500" />
        </div>
      </div>
    </div>
  );
}

function DraftCard({
  draft,
  onResume,
  onDelete,
}: {
  draft: DraftData;
  onResume: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const specialtyIcons: Record<string, React.ReactNode> = {
    cardiology: <Heart className="w-5 h-5" />,
    neurology: <Brain className="w-5 h-5" />,
    oncology: <Activity className="w-5 h-5" />,
  };

  const specialtyNames: Record<string, string> = {
    cardiology: "Kardiologi",
    neurology: "Neurologi",
    oncology: "Onkologi",
  };

  const progress = draftManager.calculateDraftProgress(draft);
  const nextStage = draftManager.getNextStage(draft);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="group bg-white rounded-[2rem] border-2 border-gray-100 hover:border-[#0F4C81] hover:shadow-2xl transition-all duration-500 overflow-hidden">
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex gap-5">
            <div className="w-16 h-16 bg-yellow-50 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-black text-gray-900">Draft Assessment</h3>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest rounded-full">In Progress</span>
              </div>
              <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Dibuat {formatDate(draft.updatedAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onDelete}
            className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>

        

        {/* Detail Pelayanan & Next Steps Container */}
        <div className="flex flex-col gap-8 mb-8">
          
          {/* Next Steps (Moved to top of details for better visibility) */}
          {nextStage && (
            <div className="bg-[#0F4C81] rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl" />
              <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Langkah Berikutnya</p>
              <h4 className="text-lg font-bold mb-1">{specialtyNames[nextStage.specialty]}</h4>
              <p className="text-white/80 text-sm font-medium">
                {nextStage.stage === "rsbk"
                  ? "Hospital Structure Form"
                  : nextStage.stage === "clinicalAudit"
                    ? "Clinical Audit Assessment"
                    : "Patient Experience Report"}
              </p>
            </div>
          )}

          {/* Specialties Detailed Progress List */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Progress per Pelayanan</p>
            <div className="grid gap-4">
              {draft.selectedSpecialties.map((spec) => {
                const specDetails = progress.details?.[spec];

                return (
                  <div key={spec} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-[#0F4C81] bg-blue-50 p-2 rounded-lg">{specialtyIcons[spec]}</div>
                      <h3 className="font-bold text-gray-900 capitalize">{specialtyNames[spec]}</h3>
                    </div>

                    <div className="space-y-4">
                      {/* 1. RSBK Stage */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-2 font-medium text-gray-700">
                            <Building2 className="w-4 h-4 text-[#0F4C81]" />
                            Hospital Structure (RSBK)
                          </span>
                          <span className="text-gray-500 font-medium">
                            {specDetails?.rsbk?.filled || 0} / {specDetails?.rsbk?.total || 15} Item
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#0F4C81] to-[#14B8A6] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${specDetails?.rsbk?.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* 2. Clinical Audit Stage */}
                      <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-2 font-medium text-gray-700">
                            <FileText className="w-4 h-4 text-blue-600" />
                            Clinical Audit
                          </span>
                          {specDetails?.clinicalAudit?.completed ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Lengkap (100%)
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-gray-400">Belum diisi</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-blue-100/50">
                          <span className="text-gray-600">
                            <strong className="text-gray-900">{specDetails?.clinicalAudit?.patientCount || 0}</strong> Pasien Diinput
                          </span>
                          <span className="font-semibold text-[#0F4C81] flex items-center gap-1">
                            Bobot Volume: 
                            <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-blue-100">
                              {(specDetails?.clinicalAudit?.weight || 0).toFixed(2)}x
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* 3. Patient Report (PREM/PROM) Stage */}
                      <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-2 font-medium text-gray-700">
                            <Users className="w-4 h-4 text-teal-600" />
                            Patient Report (PREM/PROM)
                          </span>
                          {specDetails?.patientReport?.completed ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Lengkap (100%)
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-gray-400">Belum diisi</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-teal-100/50">
                          <span className="text-gray-600">
                            <strong className="text-gray-900">{specDetails?.patientReport?.patientCount || 0}</strong> Pasien Diinput
                          </span>
                          <span className="font-semibold text-teal-700 flex items-center gap-1">
                            Bobot Volume: 
                            <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-teal-100">
                              {(specDetails?.patientReport?.weight || 0).toFixed(2)}x
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Button
          onClick={onResume}
          className="w-full h-18 bg-gray-900 hover:bg-black text-white rounded-[1.25rem] font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-95 border-none py-8"
        >
          <Play className="w-6 h-6 mr-3 fill-current" />
          LANJUTKAN ASSESSMENT
          <ChevronRight className="w-6 h-6 ml-auto" />
        </Button>
      </div>
    </div>
  );
}