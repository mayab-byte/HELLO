import Header from '@/components/site/Header';
import Hero from '@/components/site/Hero';
import TrustBar from '@/components/site/TrustBar';
import Services from '@/components/site/Services';
import About from '@/components/site/About';
import Gallery from '@/components/site/Gallery';
import Testimonials from '@/components/site/Testimonials';
import Posts from '@/components/site/Posts';
import ContactCta from '@/components/site/ContactCta';
import Footer from '@/components/site/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <TrustBar />
        <Services />
        <About />
        <Gallery />
        <Testimonials />
        <Posts />
        <ContactCta />
      </main>
      <Footer />
    </>
  );
}
