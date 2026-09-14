import { QrDisplay } from "@/components/attendance/QrDisplay";

/**
 * 연구실 입구에 상시 띄워둘 전용 화면. (main) route group 밖에 위치해
 * StatusBar/Navigation/Footer를 상속하지 않는다(login/page.tsx와 동일한 이유).
 * 로그인 세션이 없는 공용 기기(태블릿/모니터)에서 계속 열어두는 용도라
 * 이 페이지 자체는 로그인을 요구하지 않는다.
 */
export default function AttendanceDisplayPage() {
  return <QrDisplay />;
}
