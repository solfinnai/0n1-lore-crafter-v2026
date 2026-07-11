import { MultiStepForm } from "@/components/multi-step-form"
import { SplashScreen } from "@/components/splash-screen"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <SplashScreen />
      <MultiStepForm />
    </main>
  )
}
