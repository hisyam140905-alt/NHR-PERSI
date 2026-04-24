import { Heart, Brain, Activity } from "lucide-react";
import { useNavigate } from "react-router";
import { draftManager } from "../utils/draftManager";
import { useState, useEffect } from "react";

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

const specialtyColors: Record<string, string> = {
  cardiology: "bg-red-500",
  neurology: "bg-blue-500",
  oncology: "bg-purple-500",
};

const stageLabels: Record<string, string> = {
  rsbk: "Hospital Structure Form",
  "clinical-audit": "Clinical Audit",
  "patient-report": "Patient Report",
  result: "Review & Submit",
};

export function SpecialtyProgressTracker({
  currentSpecialty,
  currentStage,
}: {
  currentSpecialty: string;
  currentStage: "rsbk" | "clinical-audit" | "patient-report" | "result";
}) {
  const navigate = useNavigate();

  // Get selected specialties from session
  const selectedSpecialtiesStr = sessionStorage.getItem("selectedSpecialties");
  const selectedSpecialties: string[] = selectedSpecialtiesStr
    ? JSON.parse(selectedSpecialtiesStr)
    : [currentSpecialty];

  const currentIndex = selectedSpecialties.indexOf(currentSpecialty);

  const stages = ["rsbk", "clinical-audit", "patient-report", "result"];

  const navigateToSpecialty = (spec: string, stage: string) => {
    if (stage === "rsbk") navigate(`/siap-persi/rsbk/${spec}`);
    else if (stage === "clinical-audit") navigate(`/siap-persi/clinical-audit/${spec}`);
    else if (stage === "patient-report") navigate(`/siap-persi/patient-report/${spec}`);
    else navigate(`/siap-persi/result/${spec}`);
  };

  // --- THE FIX: State-driven data fetching ---
  const [progressMap, setProgressMap] = useState<any>(null);

  useEffect(() => {
    const fetchDraftData = () => {
      const draftId = draftManager.getCurrentDraftId();
      const draft = draftId ? draftManager.getDraftById(draftId) : null;
      if (draft && draft.progress) {
        setProgressMap(draft.progress[currentSpecialty]);
      }
    };

    fetchDraftData(); // Grab whatever is currently there

    // The Magic: Wait 50ms for the previous page to completely finish unmounting & saving
    // before re-checking the local storage for the fresh data!
    const timer = setTimeout(fetchDraftData, 50); 
    
    return () => clearTimeout(timer);
  }, [currentSpecialty, currentStage]);

  return (
    <div className="bg-white rounded-xl border-2 border-[#0F4C81] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Progress Multi-Pelayanan
          </h3>
          <p className="text-sm text-gray-600">
            {selectedSpecialties.length > 1
              ? `Pelayanan ${currentIndex + 1} dari ${selectedSpecialties.length}`
              : "1 pelayanan dipilih"}
          </p>
        </div>
        {selectedSpecialties.length > 1 && (
          <div className="text-right">
            <div className="text-3xl font-bold text-[#0F4C81]">
              {currentIndex + 1}/{selectedSpecialties.length}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {selectedSpecialties.length > 1 && (
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-[#0F4C81] to-[#14B8A6] h-3 rounded-full transition-all duration-500"
            style={{
              width: `${((currentIndex + 1) / selectedSpecialties.length) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Specialty Navigation */}
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedSpecialties.map((spec) => {
          const isCurrent = spec === currentSpecialty;

          return (
            <button
              key={spec}
              onClick={() => navigateToSpecialty(spec, currentStage)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                isCurrent
                  ? `${specialtyColors[spec]} border-transparent text-white font-semibold`
                  : "bg-gray-50 border-gray-300 text-gray-600 hover:border-[#0F4C81] hover:bg-blue-50"
              }`}
              title={`Pindah ke ${specialtyNames[spec]}`}
            >
              {specialtyIcons[spec]}
              <span className="text-sm font-medium">{specialtyNames[spec]}</span>
            </button>
          );
        })}
      </div>

      {/* Stage Navigation (within same specialty) */}
      <div className="flex gap-1 mb-3">
        {stages.map((stage) => {
          const isCurrent = stage === currentStage;
          
          const draftStageKey = stage === "rsbk" ? "rsbk" : stage === "clinical-audit" ? "clinicalAudit" : stage === "patient-report" ? "patientReport" : "result";
          const isCompleted = progressMap && draftStageKey !== "result" ? progressMap[draftStageKey as keyof typeof progressMap]?.completed : false;

          // QoL 2: Check if there is actual data inside the draft to mark it yellow, ignoring sequential order
          const checkIsInProgress = (stageKey: string) => {
            if (!progressMap || stageKey === "result") return false;
            const stageData = progressMap[stageKey as keyof typeof progressMap];
            if (stageKey === "clinicalAudit") {
              return (stageData?.data && Object.keys(stageData.data).length > 0) || ((stageData as any)?.currentPatient && (stageData as any)?.currentPatient > 1);
            }
            return stageData?.data && Object.keys(stageData.data).length > 0;
          };

          const isInProgress = checkIsInProgress(draftStageKey);

          return (
            <button
              key={stage}
              onClick={() => navigateToSpecialty(currentSpecialty, stage)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isCurrent
                  ? "bg-[#0F4C81] text-white"
                  : isCompleted
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : isInProgress
                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              title={stageLabels[stage]}
            >
              {isCompleted && "✓ "}{stageLabels[stage]}
            </button>
          );
        })}
      </div>

      {/* Current Stage Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-gray-700">
          <strong>Sedang mengisi:</strong> {specialtyNames[currentSpecialty]} -{" "}
          {stageLabels[currentStage]}
          {selectedSpecialties.length > 1 && (
            <span className="text-gray-500 ml-2">
              (Klik pelayanan lain untuk pindah)
            </span>
          )}
        </p>
      </div>
    </div>
  );
}