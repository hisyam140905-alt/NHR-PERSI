import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, CheckCircle2, XCircle, Upload, FileText, Eye, TrendingUp } from "lucide-react";
import { mockSubmissions } from "../data/submissions";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";

export function ReviewSubmissionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const submission = mockSubmissions.find((s) => s.id === id);

  const [checklist, setChecklist] = useState({
    dataAccuracy: submission?.reviewChecklist?.dataAccuracy || false,
    documentationComplete: submission?.reviewChecklist?.documentationComplete || false,
    accreditationVerified: submission?.reviewChecklist?.accreditationVerified || false,
    performanceDataVerified: submission?.reviewChecklist?.performanceDataVerified || false,
    safetyStandardsMet: submission?.reviewChecklist?.safetyStandardsMet || false,
    researchDataVerified: submission?.reviewChecklist?.researchDataVerified || false,
  });

  const [reviewerNotes, setReviewerNotes] = useState(submission?.reviewerNotes || "");
  const [calculatedScores, setCalculatedScores] = useState({
    clinicalScore: 0,
    researchScore: 0,
    patientExperienceScore: 0,
    facilitiesScore: 0,
    patientSafetyScore: 0,
    overallScore: 0,
  });

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Submission Not Found</h1>
          <Button onClick={() => navigate("/admin/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const checklistProgress =
    (Object.values(checklist).filter(Boolean).length / Object.values(checklist).length) * 100;

  const handleCalculateScores = () => {
    // Algorithm sederhana untuk menghitung score
    const clinical = calculateClinicalScore(submission.clinicalData);
    const research = calculateResearchScore(submission.researchData);
    const patientExp = calculatePatientExperienceScore(submission.patientExperienceData);
    const facilities = calculateFacilitiesScore(submission.facilitiesData);
    const safety = calculateSafetyScore(submission.safetyData);

    const overall = (
      clinical * 0.3 +
      research * 0.25 +
      patientExp * 0.2 +
      facilities * 0.15 +
      safety * 0.1
    );

    setCalculatedScores({
      clinicalScore: clinical,
      researchScore: research,
      patientExperienceScore: patientExp,
      facilitiesScore: facilities,
      patientSafetyScore: safety,
      overallScore: overall,
    });
  };

  const handleApprove = () => {
    if (checklistProgress < 100) {
      alert("Harap lengkapi semua checklist sebelum approve");
      return;
    }
    if (calculatedScores.overallScore === 0) {
      alert("Harap hitung score terlebih dahulu");
      return;
    }
    alert("Submission approved! Data siap dipublish.");
    navigate("/admin/dashboard");
  };

  const handleReject = () => {
    if (!reviewerNotes.trim()) {
      alert("Harap berikan catatan reviewer untuk rejection");
      return;
    }
    alert("Submission rejected. Hospital akan menerima notifikasi.");
    navigate("/admin/dashboard");
  };

  const handlePublish = () => {
    if (checklistProgress < 100) {
      alert("Harap lengkapi semua checklist sebelum publish");
      return;
    }
    if (calculatedScores.overallScore === 0) {
      alert("Harap hitung score terlebih dahulu");
      return;
    }
    alert("Ranking berhasil dipublish ke website!");
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/dashboard")}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Review: {submission.hospitalName}
              </h1>
              <p className="text-gray-600">
                {submission.city}, {submission.province} • Submitted{" "}
                {submission.submittedAt
                  ? new Date(submission.submittedAt).toLocaleDateString("id-ID")
                  : "-"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={submission.status} />
              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={handleReject}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleApprove}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                className="bg-[#0F4C81] hover:bg-[#0d3d66]"
                onClick={handlePublish}
              >
                <Upload className="w-4 h-4 mr-2" />
                Publish Ranking
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Calculated Scores */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Calculated Scores</h2>
                <Button
                  onClick={handleCalculateScores}
                  variant="outline"
                  className="border-[#0F4C81] text-[#0F4C81]"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Calculate Scores
                </Button>
              </div>

              {calculatedScores.overallScore > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#0F4C81] to-[#14B8A6] rounded-lg p-6 text-white">
                    <div className="text-sm mb-2">Overall Score</div>
                    <div className="text-5xl font-bold">
                      {calculatedScores.overallScore.toFixed(1)}
                    </div>
                    <div className="text-sm opacity-90">/ 100</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ScoreCard
                      title="Clinical Score"
                      score={calculatedScores.clinicalScore}
                      weight="30%"
                    />
                    <ScoreCard
                      title="Research Score"
                      score={calculatedScores.researchScore}
                      weight="25%"
                    />
                    <ScoreCard
                      title="Patient Experience"
                      score={calculatedScores.patientExperienceScore}
                      weight="20%"
                    />
                    <ScoreCard
                      title="Facilities Score"
                      score={calculatedScores.facilitiesScore}
                      weight="15%"
                    />
                    <ScoreCard
                      title="Patient Safety"
                      score={calculatedScores.patientSafetyScore}
                      weight="10%"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Click "Calculate Scores" untuk menghitung score berdasarkan data submission
                </div>
              )}
            </div>

            {/* Submission Data */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Submission Data</h2>

              <Tabs defaultValue="basic">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="clinical">Clinical</TabsTrigger>
                  <TabsTrigger value="research">Research</TabsTrigger>
                  <TabsTrigger value="patient">Patient Exp.</TabsTrigger>
                  <TabsTrigger value="facilities">Facilities</TabsTrigger>
                  <TabsTrigger value="safety">Safety</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <DataField label="Hospital Name" value={submission.hospitalName} />
                  <DataField label="City" value={submission.city} />
                  <DataField label="Province" value={submission.province} />
                  <DataField label="Type" value={`Type ${submission.type}`} />
                  <DataField label="Ownership" value={submission.ownership} />
                  <DataField label="Accreditation" value={submission.accreditation} />
                  <DataField label="Beds" value={submission.beds.toString()} />
                  <DataField label="Founded" value={submission.founded.toString()} />
                  <DataField
                    label="Specialties"
                    value={submission.specialties.join(", ")}
                  />
                </TabsContent>

                <TabsContent value="clinical" className="space-y-4 mt-4">
                  <DataField
                    label="Treatment Success Rate"
                    value={`${submission.clinicalData.treatmentSuccessRate}%`}
                  />
                  <DataField
                    label="Readmission Rate"
                    value={`${submission.clinicalData.readmissionRate}%`}
                  />
                  <DataField
                    label="Mortality Rate"
                    value={`${submission.clinicalData.mortalityRate}%`}
                  />
                  <DataField
                    label="Emergency Response Time"
                    value={`${submission.clinicalData.emergencyResponseTime} minutes`}
                  />
                </TabsContent>

                <TabsContent value="research" className="space-y-4 mt-4">
                  <DataField
                    label="Publications"
                    value={submission.researchData.publications.toString()}
                  />
                  <DataField
                    label="Clinical Trials"
                    value={submission.researchData.clinicalTrials.toString()}
                  />
                  <DataField
                    label="Research Grants"
                    value={submission.researchData.researchGrants.toString()}
                  />
                  <DataField
                    label="Medical Education Programs"
                    value={submission.researchData.medicalEducationPrograms.toString()}
                  />
                </TabsContent>

                <TabsContent value="patient" className="space-y-4 mt-4">
                  <DataField
                    label="Satisfaction Score"
                    value={`${submission.patientExperienceData.satisfactionScore}%`}
                  />
                  <DataField
                    label="Average Wait Time"
                    value={`${submission.patientExperienceData.averageWaitTime} minutes`}
                  />
                  <DataField
                    label="Complaint Resolution Rate"
                    value={`${submission.patientExperienceData.complaintResolutionRate}%`}
                  />
                </TabsContent>

                <TabsContent value="facilities" className="space-y-4 mt-4">
                  <DataField
                    label="CT Scanners"
                    value={submission.facilitiesData.ctScanners.toString()}
                  />
                  <DataField
                    label="MRI Machines"
                    value={submission.facilitiesData.mriMachines.toString()}
                  />
                  <DataField
                    label="ICU Beds"
                    value={submission.facilitiesData.icuBeds.toString()}
                  />
                  <DataField
                    label="Operating Theaters"
                    value={submission.facilitiesData.operatingTheaters.toString()}
                  />
                  <DataField
                    label="Electronic Health Record"
                    value={submission.facilitiesData.hasEHR ? "Yes" : "No"}
                  />
                  <DataField
                    label="Telemedicine"
                    value={submission.facilitiesData.hasTelemedicine ? "Yes" : "No"}
                  />
                </TabsContent>

                <TabsContent value="safety" className="space-y-4 mt-4">
                  <DataField
                    label="Infection Rate"
                    value={`${submission.safetyData.infectionRate}%`}
                  />
                  <DataField
                    label="Adverse Event Rate"
                    value={`${submission.safetyData.adverseEventRate}%`}
                  />
                  <DataField
                    label="Medication Error Rate"
                    value={`${submission.safetyData.medicationErrorRate}%`}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Supporting Documents</h2>
              <div className="space-y-3">
                {submission.documents.accreditationCertificate && (
                  <DocumentItem
                    name="Accreditation Certificate"
                    filename={submission.documents.accreditationCertificate}
                  />
                )}
                {submission.documents.annualReport && (
                  <DocumentItem
                    name="Annual Report"
                    filename={submission.documents.annualReport}
                  />
                )}
                {submission.documents.safetyReport && (
                  <DocumentItem
                    name="Safety Report"
                    filename={submission.documents.safetyReport}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Review Checklist */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Review Checklist</h2>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-[#0F4C81]">
                    {checklistProgress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={checklistProgress} className="h-2" />
              </div>

              <div className="space-y-3">
                <ChecklistItem
                  label="Data Accuracy Verified"
                  checked={checklist.dataAccuracy}
                  onChange={(checked) =>
                    setChecklist({ ...checklist, dataAccuracy: checked })
                  }
                />
                <ChecklistItem
                  label="Documentation Complete"
                  checked={checklist.documentationComplete}
                  onChange={(checked) =>
                    setChecklist({ ...checklist, documentationComplete: checked })
                  }
                />
                <ChecklistItem
                  label="Accreditation Verified"
                  checked={checklist.accreditationVerified}
                  onChange={(checked) =>
                    setChecklist({ ...checklist, accreditationVerified: checked })
                  }
                />
                <ChecklistItem
                  label="Performance Data Verified"
                  checked={checklist.performanceDataVerified}
                  onChange={(checked) =>
                    setChecklist({ ...checklist, performanceDataVerified: checked })
                  }
                />
                <ChecklistItem
                  label="Safety Standards Met"
                  checked={checklist.safetyStandardsMet}
                  onChange={(checked) =>
                    setChecklist({ ...checklist, safetyStandardsMet: checked })
                  }
                />
                <ChecklistItem
                  label="Research Data Verified"
                  checked={checklist.researchDataVerified}
                  onChange={(checked) =>
                    setChecklist({ ...checklist, researchDataVerified: checked })
                  }
                />
              </div>
            </div>

            {/* Reviewer Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Reviewer Notes</h2>
              <Textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Tambahkan catatan review di sini..."
                rows={8}
              />
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">Email</div>
                  <a
                    href={`mailto:${submission.contactEmail}`}
                    className="text-[#0F4C81] hover:underline"
                  >
                    {submission.contactEmail}
                  </a>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Phone</div>
                  <a
                    href={`tel:${submission.contactPhone}`}
                    className="text-[#0F4C81] hover:underline"
                  >
                    {submission.contactPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for score calculation
function calculateClinicalScore(data: any): number {
  const successScore = data.treatmentSuccessRate;
  const readmissionScore = 100 - data.readmissionRate * 10;
  const mortalityScore = 100 - data.mortalityRate * 20;
  const emergencyScore = Math.max(0, 100 - data.emergencyResponseTime * 2);
  return Math.min(100, (successScore + readmissionScore + mortalityScore + emergencyScore) / 4);
}

function calculateResearchScore(data: any): number {
  const publicationScore = Math.min(100, data.publications * 5);
  const trialScore = Math.min(100, data.clinicalTrials * 15);
  const grantScore = Math.min(100, data.researchGrants * 10);
  const educationScore = Math.min(100, data.medicalEducationPrograms * 20);
  return (publicationScore + trialScore + grantScore + educationScore) / 4;
}

function calculatePatientExperienceScore(data: any): number {
  const satisfactionScore = data.satisfactionScore;
  const waitTimeScore = Math.max(0, 100 - data.averageWaitTime * 1.5);
  const resolutionScore = data.complaintResolutionRate;
  return (satisfactionScore + waitTimeScore + resolutionScore) / 3;
}

function calculateFacilitiesScore(data: any): number {
  const ctScore = Math.min(100, data.ctScanners * 25);
  const mriScore = Math.min(100, data.mriMachines * 30);
  const icuScore = Math.min(100, data.icuBeds * 3);
  const theaterScore = Math.min(100, data.operatingTheaters * 15);
  const ehrScore = data.hasEHR ? 100 : 0;
  const teleScore = data.hasTelemedicine ? 100 : 0;
  return (ctScore + mriScore + icuScore + theaterScore + ehrScore + teleScore) / 6;
}

function calculateSafetyScore(data: any): number {
  const infectionScore = Math.max(0, 100 - data.infectionRate * 30);
  const adverseScore = Math.max(0, 100 - data.adverseEventRate * 40);
  const medicationScore = Math.max(0, 100 - data.medicationErrorRate * 50);
  return (infectionScore + adverseScore + medicationScore) / 3;
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    submitted: { label: "Submitted", color: "bg-yellow-100 text-yellow-700" },
    under_review: { label: "Under Review", color: "bg-purple-100 text-purple-700" },
    approved: { label: "Approved", color: "bg-green-100 text-green-700" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
    published: { label: "Published", color: "bg-teal-100 text-teal-700" },
  };

  const config = statusConfig[status] || statusConfig.submitted;

  return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
}

function ScoreCard({
  title,
  score,
  weight,
}: {
  title: string;
  score: number;
  weight: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-[#0F4C81]">{score.toFixed(1)}</div>
        <div className="text-sm text-gray-500">× {weight}</div>
      </div>
      <Progress value={score} className="h-1 mt-2" />
    </div>
  );
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function DocumentItem({ name, filename }: { name: string; filename: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-[#0F4C81]" />
        <div>
          <div className="text-sm font-medium text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{filename}</div>
        </div>
      </div>
      <Button variant="ghost" size="sm">
        <Eye className="w-4 h-4" />
      </Button>
    </div>
  );
}

function ChecklistItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <Checkbox checked={checked} onCheckedChange={onChange} className="mt-0.5" />
      <label className="text-sm text-gray-700 flex-1 cursor-pointer">{label}</label>
    </div>
  );
}
