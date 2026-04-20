export type SubmissionStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "published";

export interface HospitalSubmission {
  id: string;
  hospitalName: string;
  city: string;
  province: string;
  type: "A" | "B" | "C";
  ownership: "Public" | "Private";
  contactEmail: string;
  contactPhone: string;
  
  // Basic Information
  accreditation: string;
  beds: number;
  founded: number;
  specialties: string[];
  
  // Performance Data
  clinicalData: {
    treatmentSuccessRate: number;
    readmissionRate: number;
    mortalityRate: number;
    emergencyResponseTime: number;
  };
  
  researchData: {
    publications: number;
    clinicalTrials: number;
    researchGrants: number;
    medicalEducationPrograms: number;
  };
  
  patientExperienceData: {
    satisfactionScore: number;
    averageWaitTime: number;
    complaintResolutionRate: number;
  };
  
  facilitiesData: {
    ctScanners: number;
    mriMachines: number;
    icuBeds: number;
    operatingTheaters: number;
    hasEHR: boolean;
    hasTelemedicine: boolean;
  };
  
  safetyData: {
    infectionRate: number;
    adverseEventRate: number;
    medicationErrorRate: number;
  };
  
  // Supporting Documents
  documents: {
    accreditationCertificate?: string;
    annualReport?: string;
    safetyReport?: string;
  };
  
  // Submission metadata
  status: SubmissionStatus;
  submittedAt?: Date;
  reviewedAt?: Date;
  publishedAt?: Date;
  reviewerId?: string;
  reviewerNotes?: string;
  
  // Review Checklist
  reviewChecklist?: {
    dataAccuracy: boolean;
    documentationComplete: boolean;
    accreditationVerified: boolean;
    performanceDataVerified: boolean;
    safetyStandardsMet: boolean;
    researchDataVerified: boolean;
  };
  
  // Calculated Scores
  calculatedScores?: {
    overallScore: number;
    clinicalScore: number;
    researchScore: number;
    patientExperienceScore: number;
    facilitiesScore: number;
    patientSafetyScore: number;
  };
}

export const mockSubmissions: HospitalSubmission[] = [
  {
    id: "sub-001",
    hospitalName: "RS Harapan Sehat",
    city: "Surabaya",
    province: "Jawa Timur",
    type: "B",
    ownership: "Private",
    contactEmail: "admin@harapansehat.co.id",
    contactPhone: "031-1234567",
    accreditation: "KARS Paripurna",
    beds: 250,
    founded: 2010,
    specialties: ["Cardiology", "Orthopedics"],
    clinicalData: {
      treatmentSuccessRate: 92.5,
      readmissionRate: 5.2,
      mortalityRate: 1.8,
      emergencyResponseTime: 15,
    },
    researchData: {
      publications: 12,
      clinicalTrials: 3,
      researchGrants: 5,
      medicalEducationPrograms: 2,
    },
    patientExperienceData: {
      satisfactionScore: 88.5,
      averageWaitTime: 25,
      complaintResolutionRate: 92,
    },
    facilitiesData: {
      ctScanners: 2,
      mriMachines: 1,
      icuBeds: 20,
      operatingTheaters: 5,
      hasEHR: true,
      hasTelemedicine: true,
    },
    safetyData: {
      infectionRate: 1.2,
      adverseEventRate: 0.8,
      medicationErrorRate: 0.3,
    },
    documents: {
      accreditationCertificate: "cert-001.pdf",
      annualReport: "report-2025.pdf",
    },
    status: "submitted",
    submittedAt: new Date("2026-01-15"),
  },
  {
    id: "sub-002",
    hospitalName: "RS Bunda Medika",
    city: "Medan",
    province: "Sumatera Utara",
    type: "B",
    ownership: "Private",
    contactEmail: "info@bundamedika.co.id",
    contactPhone: "061-9876543",
    accreditation: "KARS Paripurna",
    beds: 180,
    founded: 2015,
    specialties: ["Pediatrics", "Obstetrics"],
    clinicalData: {
      treatmentSuccessRate: 90.2,
      readmissionRate: 6.1,
      mortalityRate: 2.1,
      emergencyResponseTime: 18,
    },
    researchData: {
      publications: 8,
      clinicalTrials: 2,
      researchGrants: 3,
      medicalEducationPrograms: 1,
    },
    patientExperienceData: {
      satisfactionScore: 86.3,
      averageWaitTime: 30,
      complaintResolutionRate: 88,
    },
    facilitiesData: {
      ctScanners: 1,
      mriMachines: 1,
      icuBeds: 15,
      operatingTheaters: 4,
      hasEHR: true,
      hasTelemedicine: false,
    },
    safetyData: {
      infectionRate: 1.5,
      adverseEventRate: 1.1,
      medicationErrorRate: 0.4,
    },
    documents: {
      accreditationCertificate: "cert-002.pdf",
    },
    status: "under_review",
    submittedAt: new Date("2026-01-10"),
    reviewerId: "reviewer-01",
    reviewChecklist: {
      dataAccuracy: true,
      documentationComplete: false,
      accreditationVerified: true,
      performanceDataVerified: true,
      safetyStandardsMet: true,
      researchDataVerified: false,
    },
  },
];
