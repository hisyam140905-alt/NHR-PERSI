import { useParams, Link } from "react-router";
import { MapPin, Building2, Calendar, Bed, Award, ChevronLeft } from "lucide-react";
import { hospitals } from "../data/hospitals";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function HospitalDetailPage() {
  const { id } = useParams();
  const hospital = hospitals.find((h) => h.id === id);

  if (!hospital) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hospital Not Found</h1>
          <Link to="/rankings">
            <Button>Back to Rankings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const radarData = [
    { subject: "Clinical", value: hospital.clinicalScore, fullMark: 100 },
    { subject: "Research", value: hospital.researchScore, fullMark: 100 },
    { subject: "Patient Exp.", value: hospital.patientExperienceScore, fullMark: 100 },
    { subject: "Facilities", value: hospital.facilitiesScore, fullMark: 100 },
    { subject: "Safety", value: hospital.patientSafetyScore, fullMark: 100 },
  ];

  const comparisonData = [
    {
      category: "Clinical Score",
      hospital: hospital.clinicalScore,
      national: 85.4,
    },
    {
      category: "Research",
      hospital: hospital.researchScore,
      national: 82.1,
    },
    {
      category: "Patient Exp.",
      hospital: hospital.patientExperienceScore,
      national: 86.8,
    },
    {
      category: "Facilities",
      hospital: hospital.facilitiesScore,
      national: 84.3,
    },
    {
      category: "Safety",
      hospital: hospital.patientSafetyScore,
      national: 87.2,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link to="/rankings">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Rankings
            </Button>
          </Link>
        </div>
      </div>

      {/* Hospital Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0F4C81] to-[#14B8A6] rounded-xl flex items-center justify-center">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{hospital.name}</h1>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                      hospital.rank <= 3
                        ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    #{hospital.rank}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {hospital.city}, {hospital.province}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    <span>Type {hospital.type} Hospital</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{hospital.beds} beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Est. {hospital.founded}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#14B8A6]" />
                  <span className="text-sm font-medium text-gray-700">
                    {hospital.accreditation}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Overall Score</div>
              <div className="text-5xl font-bold text-[#0F4C81]">
                {hospital.overallScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">/ 100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Performance Radar */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Performance Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#6b7280" }} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#0F4C81"
                  fill="#0F4C81"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Right Column - Score Cards */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <ScoreCard
              title="Clinical Score"
              score={hospital.clinicalScore}
              color="bg-blue-50"
              textColor="text-[#0F4C81]"
            />
            <ScoreCard
              title="Research Score"
              score={hospital.researchScore}
              color="bg-teal-50"
              textColor="text-[#14B8A6]"
            />
            <ScoreCard
              title="Patient Experience"
              score={hospital.patientExperienceScore}
              color="bg-blue-50"
              textColor="text-[#0F4C81]"
            />
            <ScoreCard
              title="Facilities Score"
              score={hospital.facilitiesScore}
              color="bg-teal-50"
              textColor="text-[#14B8A6]"
            />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-white border border-gray-200 p-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="clinical">Clinical Performance</TabsTrigger>
              <TabsTrigger value="research">Research & Education</TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
              <TabsTrigger value="experience">Patient Experience</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Hospital Overview</h3>
                <div className="space-y-4 text-gray-700 mb-8">
                  <p>
                    {hospital.name} is a {hospital.ownership.toLowerCase()}{" "}
                    {hospital.type}-type hospital located in {hospital.city}, {hospital.province}.
                    With {hospital.beds} beds, it serves as a major healthcare facility in the
                    region.
                  </p>
                  <p>
                    The hospital holds {hospital.accreditation} accreditation, demonstrating its
                    commitment to quality healthcare delivery and patient safety standards.
                  </p>
                </div>

                <h4 className="font-semibold text-gray-900 mb-4">Specialties</h4>
                <div className="flex flex-wrap gap-2 mb-8">
                  {hospital.specialty?.map((spec) => (
                    <span
                      key={spec}
                      className="px-3 py-1 bg-blue-50 text-[#0F4C81] rounded-full text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <h4 className="font-semibold text-gray-900 mb-4">
                  Benchmark vs National Average
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#6b7280" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hospital" fill="#0F4C81" name={hospital.name} />
                    <Bar dataKey="national" fill="#14B8A6" name="National Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="mt-6">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Clinical Performance Indicators
                </h3>

                <div className="space-y-6">
                  <PerformanceIndicator
                    title="Treatment Outcomes"
                    score={hospital.clinicalScore}
                    description="Quality of clinical outcomes and evidence-based treatment protocols"
                  />
                  <PerformanceIndicator
                    title="Patient Safety"
                    score={hospital.patientSafetyScore}
                    description="Safety protocols, infection control, and adverse event prevention"
                  />
                  <PerformanceIndicator
                    title="Medical Staff Quality"
                    score={93.5}
                    description="Specialist qualifications, training, and continuous education"
                  />
                  <PerformanceIndicator
                    title="Emergency Response"
                    score={91.2}
                    description="Emergency department efficiency and critical care capabilities"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="research" className="mt-6">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Research & Education Output
                </h3>

                <div className="space-y-6">
                  <PerformanceIndicator
                    title="Research Publications"
                    score={hospital.researchScore}
                    description="Peer-reviewed publications in indexed journals"
                  />
                  <PerformanceIndicator
                    title="Clinical Trials"
                    score={88.7}
                    description="Active participation in national and international clinical trials"
                  />
                  <PerformanceIndicator
                    title="Medical Education"
                    score={90.3}
                    description="Residency programs, fellowships, and continuous medical education"
                  />
                  <PerformanceIndicator
                    title="Innovation & Technology"
                    score={87.9}
                    description="Adoption of new medical technologies and treatment innovations"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="facilities" className="mt-6">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Facilities & Infrastructure
                </h3>

                <div className="space-y-6">
                  <PerformanceIndicator
                    title="Medical Equipment"
                    score={hospital.facilitiesScore}
                    description="State-of-the-art diagnostic and treatment equipment"
                  />
                  <PerformanceIndicator
                    title="Operating Theaters"
                    score={92.1}
                    description="Modern surgical facilities with advanced technology"
                  />
                  <PerformanceIndicator
                    title="ICU Capacity"
                    score={89.8}
                    description="Intensive care units with advanced life support systems"
                  />
                  <PerformanceIndicator
                    title="Digital Infrastructure"
                    score={88.4}
                    description="Electronic health records, telemedicine, and digital systems"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="mt-6">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Patient Experience</h3>

                <div className="space-y-6">
                  <PerformanceIndicator
                    title="Overall Satisfaction"
                    score={hospital.patientExperienceScore}
                    description="Patient satisfaction surveys and feedback ratings"
                  />
                  <PerformanceIndicator
                    title="Wait Times"
                    score={86.5}
                    description="Outpatient and emergency department wait time performance"
                  />
                  <PerformanceIndicator
                    title="Communication"
                    score={91.8}
                    description="Doctor-patient communication and information transparency"
                  />
                  <PerformanceIndicator
                    title="Amenities & Comfort"
                    score={89.2}
                    description="Room quality, cleanliness, and patient comfort facilities"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({
  title,
  score,
  color,
  textColor,
}: {
  title: string;
  score: number;
  color: string;
  textColor: string;
}) {
  return (
    <div className={`${color} rounded-xl p-6`}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      <div className={`text-4xl font-bold ${textColor} mb-2`}>{score.toFixed(1)}</div>
      <Progress value={score} className="h-2" />
    </div>
  );
}

function PerformanceIndicator({
  title,
  score,
  description,
}: {
  title: string;
  score: number;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-semibold text-gray-900">{title}</h5>
        <span className="text-lg font-bold text-[#0F4C81]">{score.toFixed(1)}</span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <Progress value={score} className="h-2" />
    </div>
  );
}
