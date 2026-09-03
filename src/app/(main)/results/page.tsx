import { RegisterResultModal } from "@/components/results/RegisterResultModal";
import { ResultList } from "@/components/results/ResultList";
import { ResultsSidebar } from "@/components/results/ResultsSidebar";
import { ResultsToolbar } from "@/components/results/ResultsToolbar";

export default function ResultsPage() {
  return (
    <>
      <RegisterResultModal />

      <div className="mx-auto grid max-w-[1220px] grid-cols-[1fr_300px] items-start gap-[22px] px-7 pt-[22px] pb-[90px] max-[960px]:grid-cols-1">
        <div>
          <ResultsToolbar />
          <ResultList />
        </div>
        <ResultsSidebar />
      </div>
    </>
  );
}
