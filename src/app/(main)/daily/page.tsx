import { DailyBoard } from "@/components/daily/DailyBoard";
import { DailySidebar } from "@/components/daily/DailySidebar";

export default function DailyPage() {
  return <DailyBoard sidebar={<DailySidebar />} />;
}
