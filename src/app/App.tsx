import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Sidebar } from "./components/Sidebar";
import { MainScreen } from "./components/MainScreen";
import { ReviewWorkspace } from "./components/ReviewWorkspace";
import { AddPOIScreen } from "./components/AddPOIScreen";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { ReportsScreen } from "./components/ReportsScreen";
import { ExcelUploadModal } from "./components/ExcelUploadModal";
import { mockRequests } from "./components/data";
import type { POIRequest } from "./components/data";
import { CheckCircle, ChevronLeft } from "lucide-react";

type View = "main" | "review" | "addPOI" | "reports";

export default function App() {
  const [view, setView] = useState<View>("main");
  const [selectedRequest, setSelectedRequest] = useState<POIRequest | null>(null);
  const [requestIndex, setRequestIndex] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [isSupervisorMode] = useState(false); // toggle for supervisor demo

  const handleReview = (request: POIRequest) => {
    const idx = mockRequests.findIndex(r => r.id === request.id);
    setRequestIndex(idx);
    setSelectedRequest(request);
    setView("review");
  };

  const handleNext = () => {
    const nextIdx = (requestIndex + 1) % mockRequests.length;
    setRequestIndex(nextIdx);
    setSelectedRequest(mockRequests[nextIdx]);
  };

  const handlePrev = () => {
    const prevIdx = (requestIndex - 1 + mockRequests.length) % mockRequests.length;
    setRequestIndex(prevIdx);
    setSelectedRequest(mockRequests[prevIdx]);
  };

  const handleConfirmPublish = () => {
    setShowConfirmation(false);
    toast.custom(() => (
      <div className="flex items-start gap-3 bg-[#1e2533] border border-emerald-500/30 rounded-xl px-4 py-3 shadow-2xl min-w-[320px]" dir="rtl">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">تم الاعتماد بنجاح</p>
          <p className="text-xs text-white/50 mt-0.5">تم اعتماد البيانات وعكسها على خريطة بلدي+ بنجاح</p>
          <button
            onClick={() => { toast.dismiss(); handleNext(); }}
            className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            مراجعة الطلب التالي <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
      </div>
    ), { duration: 6000 });
    setView("main");
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#0d1117] text-white"
      dir="rtl"
      style={{ fontFamily: "'Cairo', 'Segoe UI', sans-serif" }}
    >
      <Toaster position="bottom-left" />
      {showExcelUpload && (
        <ExcelUploadModal onClose={() => setShowExcelUpload(false)} isSupervisor={isSupervisorMode} />
      )}

      {/* Full-screen content area */}
      <div className="flex-1 relative overflow-hidden">
        {view === "main" && (
          <MainScreen
            onReview={handleReview}
            onAddPOI={() => setView("addPOI")}
            onExcelUpload={() => setShowExcelUpload(true)}
          />
        )}

        {view === "reports" && <ReportsScreen />}

        {view === "review" && selectedRequest && (
          <div className="relative h-full">
            <ReviewWorkspace
              request={selectedRequest}
              onClose={() => setView("main")}
              onApprove={() => setShowConfirmation(true)}
              onNext={handleNext}
              onPrev={handlePrev}
              hasNext={requestIndex < mockRequests.length - 1}
              hasPrev={requestIndex > 0}
            />
            {showConfirmation && (
              <ConfirmationModal
                request={selectedRequest}
                onConfirm={handleConfirmPublish}
                onBack={() => setShowConfirmation(false)}
              />
            )}
          </div>
        )}

        {view === "addPOI" && (
          <AddPOIScreen
            onClose={() => setView("main")}
            onSave={() => {
              setView("main");
              toast.custom(() => (
                <div className="flex items-start gap-3 bg-[#1e2533] border border-emerald-500/30 rounded-xl px-4 py-3 shadow-2xl min-w-[320px]" dir="rtl">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">تم إضافة المعلم بنجاح</p>
                    <p className="text-xs text-white/50 mt-0.5">تم إضافة واعتماد المعلم على خريطة بلدي+</p>
                  </div>
                </div>
              ), { duration: 5000 });
            }}
          />
        )}
      </div>

      {/* Sidebar always on far right */}
      <div className="order-first h-full shrink-0">
        <Sidebar
          activeItem={view === "reports" ? "reports" : "poi"}
          onNavigate={item => {
            if (item === "poi") setView("main");
            if (item === "reports") setView("reports");
          }}
        />
      </div>
    </div>
  );
}
