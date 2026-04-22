import { saveHospitalDraft, getAllHospitalDrafts, deleteHospitalDraft as deleteCloudDraft } from "./api";
import { specialtyAuditData } from "../data/specialtyAuditData";

// Strict typing applied
export interface DraftData {
  draftId: string;
  hospitalName: string;
  picName: string;
  createdAt: string;
  updatedAt: string;
  selectedSpecialties: string[];
  progress: {
    [specialty: string]: {
      rsbk: {
        completed: boolean;
        data: Record<string, string>;
        score?: number;
      };
      clinicalAudit: {
        completed: boolean;
        data: Record<string, string>;
        currentPatient?: number;
        score?: number;
      };
      patientReport: {
        completed: boolean;
        data: Record<string, unknown>;
        patientCount?: number;
      };
    };
  };
}

const DRAFTS_KEY = "siap_persi_drafts";

// THE FIX: A tiny background helper to calculate the hospital code dynamically!
const getActiveHospitalCode = (): string => {
  // Check both possible session keys just to be safe
  const sessionStr = sessionStorage.getItem("persi_hospital_session") || sessionStorage.getItem("hospitalAuth");
  if (!sessionStr) return "HOS001";

  try {
    const currentHospital = JSON.parse(sessionStr);
    const realName = currentHospital.hospitalName || currentHospital.hospital_name || "Unknown";
    
    // 1. Extract up to the first 2 words and format with hyphen
    const nameParts = realName.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
    const shortName = nameParts.slice(0, 2).join('-').toUpperCase() || "HOS";
    
    // 2. Strip out the annoying "hosp-" string from the database ID
    const cleanId = currentHospital.id ? String(currentHospital.id).replace('hosp-', '') : '';

    // 3. Combine into the clean format
    return cleanId 
      ? `${shortName}-${cleanId}` 
      : currentHospital.email
        ? `${shortName}-${currentHospital.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`
        : `${shortName}-001`;
  } catch {
    return "HOS001";
  }
};

// HELPER: Calculates volume weight for Clinical Audit and Patient Report
const getVolumeWeight = (count: number): number => {
  if (count === 0) return 0;
  if (count >= 1 && count <= 5) return 0.80;
  if (count >= 6 && count <= 10) return 0.85;
  if (count >= 11 && count <= 15) return 0.90;
  if (count >= 16 && count <= 20) return 0.95;
  return 1.0; // 21+ patients
};

export const draftManager = {
  getAllDrafts(): DraftData[] {
    const draftsStr = localStorage.getItem(DRAFTS_KEY);
    return draftsStr ? JSON.parse(draftsStr) : [];
  },

  getCurrentHospitalDrafts(): DraftData[] {
    const allDrafts = this.getAllDrafts();
    const sessionStr = sessionStorage.getItem("persi_hospital_session") || sessionStorage.getItem("hospitalAuth");
    if (!sessionStr) return [];

    try {
      const currentHospital = JSON.parse(sessionStr);
      const activeName = currentHospital.hospitalName || currentHospital.hospital_name;
      return allDrafts.filter(draft => draft.hospitalName === activeName);
    } catch (e) {
      return [];
    }
  },

  getDraftById(draftId: string): DraftData | null {
    const drafts = this.getAllDrafts();
    return drafts.find((d) => d.draftId === draftId) || null;
  },

  createDraft(hospitalName: string, picName: string, selectedSpecialties: string[]): DraftData {
    const draft: DraftData = {
      draftId: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      hospitalName,
      picName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      selectedSpecialties,
      progress: {},
    };

    selectedSpecialties.forEach((specialty) => {
      draft.progress[specialty] = {
        rsbk: { completed: false, data: {} },
        clinicalAudit: { completed: false, data: {} },
        patientReport: { completed: false, data: {} },
      };
    });

    const drafts = this.getAllDrafts();
    drafts.push(draft);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));

    // Sync to cloud with a valid specialty placeholder
    const hCode = getActiveHospitalCode();
    saveHospitalDraft(hCode, "all", draft as unknown as Record<string, unknown>)
      .then(success => {
        if (!success) console.warn("Cloud draft sync reported failure.");
      })
      .catch(err => console.error("Cloud draft sync threw error:", err));

    return draft;
  },

  updateDraft(
    draftId: string,
    specialty: string,
    stage: "rsbk" | "clinicalAudit" | "patientReport",
    data: {
      completed?: boolean;
      data?: Record<string, unknown>;
      score?: number;
      currentPatient?: number;
      patientCount?: number;
    }
  ): void {
    const drafts = this.getAllDrafts();
    const draftIndex = drafts.findIndex((d) => d.draftId === draftId);

    if (draftIndex === -1) return;

    const draft = drafts[draftIndex];

    if (!draft.progress[specialty]) {
      draft.progress[specialty] = {
        rsbk: { completed: false, data: {} },
        clinicalAudit: { completed: false, data: {} },
        patientReport: { completed: false, data: {} },
      };
    }

    draft.progress[specialty][stage] = {
      ...draft.progress[specialty][stage],
      ...data,
    } as any;

    draft.updatedAt = new Date().toISOString();
    drafts[draftIndex] = draft;
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));

    // Sync to cloud with a valid specialty placeholder
    const hCode = getActiveHospitalCode();
    saveHospitalDraft(hCode, "all", draft as unknown as Record<string, unknown>)
      .then(success => {
        if (!success) console.warn("Cloud draft update reported failure.");
      })
      .catch(err => console.error("Cloud draft update threw error:", err));
  },

  deleteDraft(draftId: string): void {
    // 1. Delete from local storage
    const drafts = this.getAllDrafts();
    const filtered = drafts.filter((d) => d.draftId !== draftId);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));

    // 🚀 THE ZOMBIE KILLER (Part 1): Add this draft ID to a Blacklist
    // This ensures syncWithCloud will never accidentally download it again.
    const deletedDrafts = JSON.parse(localStorage.getItem("siap_persi_deleted_drafts") || "[]");
    if (!deletedDrafts.includes(draftId)) {
      deletedDrafts.push(draftId);
      localStorage.setItem("siap_persi_deleted_drafts", JSON.stringify(deletedDrafts));
    }

    // 2. Clear current session data
    if (this.getCurrentDraftId() === draftId) {
      this.clearCurrentDraftId();
      sessionStorage.removeItem("selectedSpecialties");
    }

    // 3. Clean up the Cloud
    const hCode = getActiveHospitalCode();
    const cloudDraftKey = `hospital-assessment-${hCode}-all`;

    // Fire BOTH the unique ID and the master key. 
    // This guarantees the backend will delete it regardless of which query version is live!
    deleteCloudDraft(draftId).catch(() => {}); 
    deleteCloudDraft(cloudDraftKey).catch(() => {});

    // 4. Cloud Slot Overwrite: The cloud only has 1 slot per hospital.
    // If you have other local drafts remaining, we upload the most recent one to overwrite the deleted one.
    if (filtered.length > 0) {
      saveHospitalDraft(hCode, "all", filtered[filtered.length - 1] as any).catch(() => {});
    }
  },

  getCurrentDraftId(): string | null {
    return sessionStorage.getItem("currentDraftId");
  },

  setCurrentDraftId(draftId: string): void {
    sessionStorage.setItem("currentDraftId", draftId);
  },

  clearCurrentDraftId(): void {
    sessionStorage.removeItem("currentDraftId");
  },

  calculateDraftProgress(draft: DraftData) {
    let totalStages = 0;
    let completedStages = 0;
    let overallPercentage = 0;

    // Details object for the UI to render specific weights and counts
    const details: Record<string, any> = {};

    draft.selectedSpecialties.forEach((specialty) => {
      const progress = draft.progress[specialty];
      if (progress) {
        totalStages += 3; // RSBK, Clinical Audit, Patient Report
        details[specialty] = {};

        // ==========================================
        // 1. RSBK Logic: Mimic RsbkFormPage.tsx exactly
        // ==========================================
        const specialtyInfo = specialtyAuditData[specialty as keyof typeof specialtyAuditData];
        const rsbkItems = specialtyInfo ? specialtyInfo.rsbkItems : [];
        const totalRsbkItems = rsbkItems.length;
        
        const rsbkData = progress.rsbk.data || {};
        
        // Count how many required items actually have a valid value in the draft
        const filledRsbkItems = rsbkItems.filter(item => 
          rsbkData[item.id] !== null && 
          rsbkData[item.id] !== undefined && 
          rsbkData[item.id] !== ""
        ).length;

        const rsbkProgress = totalRsbkItems > 0 ? Math.round((filledRsbkItems / totalRsbkItems) * 100) : 0;
        const rsbkCompleted = rsbkProgress === 100 || progress.rsbk.completed;
        
        if (rsbkCompleted) completedStages++;
        overallPercentage += rsbkProgress;

        details[specialty].rsbk = {
          progress: rsbkProgress,
          filled: filledRsbkItems,
          total: totalRsbkItems,
          completed: rsbkCompleted
        };

        // ==========================================
        // 2. Clinical Audit Logic: 1 patient = 100%
        // ==========================================
        const caPatientCount = progress.clinicalAudit.currentPatient || 0;
        const caCompleted = caPatientCount > 0 || progress.clinicalAudit.completed;
        
        if (caCompleted) completedStages++;
        overallPercentage += caCompleted ? 100 : 0;

        details[specialty].clinicalAudit = {
          progress: caCompleted ? 100 : 0,
          patientCount: caPatientCount,
          weight: getVolumeWeight(caPatientCount),
          completed: caCompleted
        };

        // ==========================================
        // 3. Patient Report (PREM/PROM) Logic: 1 patient = 100%
        // ==========================================
        const prPatientCount = progress.patientReport.patientCount || 0;
        const prCompleted = prPatientCount > 0 || progress.patientReport.completed;
        
        if (prCompleted) completedStages++;
        overallPercentage += prCompleted ? 100 : 0;

        details[specialty].patientReport = {
          progress: prCompleted ? 100 : 0,
          patientCount: prPatientCount,
          weight: getVolumeWeight(prPatientCount),
          completed: prCompleted
        };
      }
    });

    return {
      totalStages,
      completedStages,
      percentage: totalStages > 0 ? Math.round(overallPercentage / totalStages) : 0,
      details 
    };
  },

  getNextStage(draft: DraftData): { specialty: string; stage: "rsbk" | "clinicalAudit" | "patientReport" } | null {
    for (const specialty of draft.selectedSpecialties) {
      const progress = draft.progress[specialty];
      if (!progress) return { specialty, stage: "rsbk" };
      if (!progress.rsbk.completed) return { specialty, stage: "rsbk" };
      if (!progress.clinicalAudit.completed) return { specialty, stage: "clinicalAudit" };
      if (!progress.patientReport.completed) return { specialty, stage: "patientReport" };
    }
    return null;
  },

  async syncWithCloud(): Promise<void> {
    try {
      const sessionStr = sessionStorage.getItem("persi_hospital_session") || sessionStorage.getItem("hospitalAuth");
      if (!sessionStr) return;

      let activeName = "";
      try {
        const currentHospital = JSON.parse(sessionStr);
        activeName = currentHospital.hospitalName || currentHospital.hospital_name;
      } catch (e) {
        return;
      }

      if (!activeName) return;

      // Generate the code and pull ONLY this hospital's drafts
      const hCode = getActiveHospitalCode();
      const rawCloudDrafts = await getAllHospitalDrafts(hCode, "all");
      const cloudDrafts = rawCloudDrafts as unknown as DraftData[];

      if (cloudDrafts.length > 0) {
        const myCloudDrafts = cloudDrafts.filter(cd => cd.hospitalName === activeName);
        const allLocalDrafts = this.getAllDrafts();
        const mergedDrafts = [...allLocalDrafts];

        // 🚀 THE ZOMBIE KILLER (Part 2): Load the Blacklist
        const deletedDrafts = JSON.parse(localStorage.getItem("siap_persi_deleted_drafts") || "[]");

        myCloudDrafts.forEach(cd => {
          if (!cd.draftId) return;

          // If this draft is on the blacklist, completely ignore it. DO NOT resurrect!
          if (deletedDrafts.includes(cd.draftId)) return;

          const index = mergedDrafts.findIndex(ld => ld.draftId === cd.draftId);
          if (index === -1) {
            mergedDrafts.push(cd);
          } else {
            const cloudTime = new Date(cd.updatedAt || 0).getTime();
            const localTime = new Date(mergedDrafts[index].updatedAt || 0).getTime();
            if (cloudTime > localTime) mergedDrafts[index] = cd;
          }
        });

        localStorage.setItem(DRAFTS_KEY, JSON.stringify(mergedDrafts));
      }
    } catch (err) {
      console.error("Manual cloud sync failed:", err);
    }
  }
}  