import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import Footer from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import ForWho from '@/components/landing/ForWho';
import HowItWorks from '@/components/landing/HowItWorks';
import RoadmapTeaser from '@/components/landing/RoadmapTeaser';

export default async function RootPage() {
  const { userId } = await auth();

  // Authenticated users go straight to their workspace — landing is for guests only
  if (userId) redirect('/dashboard');

  return (
    <>
      <TopBar />
      <main>
        <Hero />
        <HowItWorks />
        <ForWho />
        <RoadmapTeaser />
      </main>
      <Footer />
    </>
  );
}
