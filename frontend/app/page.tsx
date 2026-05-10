import { TopBar } from '@/components/layout/TopBar';
import { Hero } from '@/components/landing/Hero';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <TopBar />
      <Hero />
    </main>
  );
}