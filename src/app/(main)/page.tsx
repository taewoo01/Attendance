import { Battery3D } from "@/components/home/Battery3D";
import { ConsoleLog } from "@/components/home/ConsoleLog";
import { FeatureList } from "@/components/home/FeatureList";
import { HeroSection } from "@/components/home/HeroSection";

export default function Home() {
  return (
    <>
      <HeroSection>
        <Battery3D />
      </HeroSection>
      <ConsoleLog />
      <FeatureList />
    </>
  );
}
