import { StatusBar } from "@/components/layout/StatusBar";
import { Footer } from "@/components/layout/Footer";

/**
 * 기존 10개 페이지(/,  /attendance, /schedule, /results, /daily, /ideas,
 * /meetings, /files, /about, /team)가 공유하던 StatusBar/main/Footer 골격을
 * Root Layout(src/app/layout.tsx)에서 이 route group 전용 레이아웃으로 옮긴 것.
 * (main) 폴더명은 URL에 포함되지 않으므로 각 페이지의 실제 경로는 변경되지 않는다.
 * /login은 이 그룹 밖에 위치해 이 StatusBar/Footer를 상속하지 않는다.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StatusBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
