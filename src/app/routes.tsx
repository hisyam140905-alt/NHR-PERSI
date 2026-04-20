import { createBrowserRouter, Outlet } from "react-router";
import { NewHomePage } from "./pages/NewHomePage";
import { RankingListPage } from "./pages/RankingListPage";
import { MethodologyPage } from "./pages/MethodologyPage";
import { HospitalLoginPage } from "./pages/HospitalLoginPage";
import { HospitalSubmissionPage } from "./pages/HospitalSubmissionPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { ReviewSubmissionPage } from "./pages/ReviewSubmissionPage";
import { SiapPersiOverviewPage } from "./pages/SiapPersiOverviewPage";
import { SelectSpecialtyPage } from "./pages/SelectSpecialtyPage";
import { RsbkFormPage } from "./pages/RsbkFormPage";
import { ClinicalAuditPage } from "./pages/ClinicalAuditPage";
import { PatientReportPage } from "./pages/PatientReportPage";
import { SiapPersiResultPage } from "./pages/SiapPersiResultPage";
import { SubmissionSuccessPage } from "./pages/SubmissionSuccessPage";
import { SiapAdminDashboardPage } from "./pages/SiapAdminDashboardPage";
import { SiapAdminReviewPage } from "./pages/SiapAdminReviewPage";
import { PatientPremPromPage } from "./pages/PatientPremPromPage";
import { PerformanceSubmissionPage } from "./pages/PerformanceSubmissionPage";
import { NewsPage, NewsDetailPage } from "./pages/NewsPage";
import { EventsPage } from "./pages/EventsPage";
import { HospitalDetailPage } from "./pages/HospitalDetailPage";
import { HospitalReviewResultPage } from "./pages/HospitalReviewResultPage";
import { Root } from "./components/Root";
import { DataProvider } from "./context/DataContext";

// Layout that provides DataContext to all routes
function DataProviderLayout() {
  return (
    <DataProvider>
      <Outlet />
    </DataProvider>
  );
}

export const router = createBrowserRouter([
  {
    // DataProvider wraps ALL routes
    Component: DataProviderLayout,
    children: [
      // Patient Survey - Standalone (no header/footer, clean for patients)
      { path: "/patient-survey/:hospitalCode/:specialty", Component: PatientPremPromPage },
      { path: "/patient-survey/:hospitalCode", Component: PatientPremPromPage },

      {
        path: "/",
        Component: Root,
        children: [
          { index: true, Component: NewHomePage },
          { path: "rankings", Component: RankingListPage },
          { path: "rankings/:id", Component: HospitalDetailPage },
          { path: "methodology", Component: MethodologyPage },

          // News
          { path: "news", Component: NewsPage },
          { path: "news/:id", Component: NewsDetailPage },

          // Events
          { path: "events", Component: EventsPage },

          // Hospital Portal
          { path: "hospital-login", Component: HospitalLoginPage },
          { path: "submit", Component: HospitalSubmissionPage },
          { path: "submit-performance", Component: PerformanceSubmissionPage },
          { path: "hospital/hasil-penilaian", Component: HospitalReviewResultPage },

          // Admin
          { path: "admin/login", Component: AdminLoginPage },
          { path: "admin/dashboard", Component: AdminDashboardPage },
          { path: "admin/review/:id", Component: ReviewSubmissionPage },

          // NHR PERSI Routes
          { path: "siap-persi/overview", Component: SiapPersiOverviewPage },
          { path: "siap-persi/select-specialty", Component: SelectSpecialtyPage },
          { path: "siap-persi/rsbk/:specialty", Component: RsbkFormPage },
          { path: "siap-persi/clinical-audit/:specialty", Component: ClinicalAuditPage },
          { path: "siap-persi/patient-report/:specialty", Component: PatientReportPage },
          { path: "siap-persi/result/:specialty", Component: SiapPersiResultPage },
          { path: "siap-persi/submission-success", Component: SubmissionSuccessPage },
          { path: "siap-persi/admin/dashboard", Component: SiapAdminDashboardPage },
          { path: "siap-persi/admin/review/:id", Component: SiapAdminReviewPage },
        ],
      },
    ],
  },
]);
