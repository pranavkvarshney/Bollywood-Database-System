import AnimatedHero from './components/AnimatedHero';
import AnimatedSections from './components/AnimatedSections';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <AnimatedHero />
      <AnimatedSections />
      <Footer />
    </main>
  );
}
