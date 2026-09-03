import { LoginScreen } from "@/components/login/LoginScreen";

/**
 * playground-design/login.html 1:1 마이그레이션.
 * (main) route group 밖에 위치해 StatusBar/Navigation/Footer를 상속하지 않는다.
 */
export default function LoginPage() {
  return <LoginScreen />;
}
