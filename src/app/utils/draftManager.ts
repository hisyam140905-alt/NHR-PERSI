import { saveHospitalDraft, getAllHospitalDrafts, deleteHospitalDraft as deleteCloudDraft } from "./api";

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
  const sessionStr = sessionStorage.getItem("persi_hospital_session");
  if (!sessionStr) return "HOS001";

  try {
    const currentHospital = JSON.parse(sessionStr);
    const realName = currentHospital.hospitalName || currentHospital.hospital_name || "Unknown";
    return realName !== "Unknown" ? realName.substring(0, 3).toUpperCase() + "001" : "HOS001";
  } catch {
    return "HOS001";
  }
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
    const drafts = this.getAllDrafts();
    const filtered = drafts.filter((d) => d.draftId !== draftId);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));

    deleteCloudDraft(draftId)
      .then(success => {
        if (!success) console.warn("Cloud draft deletion reported failure.");
      })
      .catch(err => console.error("Cloud draft deletion threw error:", err));
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

    draft.selectedSpecialties.forEach((specialty) => {
      const progress = draft.progress[specialty];
      if (progress) {
        totalStages += 3;
        if (progress.rsbk.completed) completedStages++;
        if (progress.clinicalAudit.completed) completedStages++;
        if (progress.patientReport.completed) completedStages++;
      }
    });

    return {
      totalStages,
      completedStages,
      percentage: totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0,
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
        const localDrafts = this.getAllDrafts().filter(ld => ld.hospitalName === activeName);

        const mergedDrafts = [...localDrafts];

        myCloudDrafts.forEach(cd => {
          if (!cd.draftId) return;

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
};