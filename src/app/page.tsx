import { Header, Footer } from '@/shared';
import {
  Hero,
  SocialProof,
  WhyBrittany,
  Programs,
  Testimonials,
  FAQ,
  CTAFinal,
} from '@/features/landing';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <WhyBrittany />
        <Programs />
        <Testimonials />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
