import Hero from "@/components/Hero";
import ConceptSection from "@/components/ConceptSection";
import FrequencyTherapySection from "@/components/FrequencyTherapySection";
import ThomResources from "@/components/ThomResources";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Feldengine – Morphogenese & Katastrophentheorie | René Thom</title>
        <meta 
          name="description" 
          content="Feldengine: Ein konzeptuelles Framework basierend auf René Thoms Katastrophentheorie. Chreoden, Attraktoren und morphogenetische Felder in der Frequenztherapie." 
        />
        <meta name="keywords" content="René Thom, Katastrophentheorie, Morphogenese, Chreoden, Attraktoren, Frequenztherapie, Semiomorphogenetik" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <Hero />
        <ConceptSection />
        <FrequencyTherapySection />
        <section id="ressourcen">
          <ThomResources />
        </section>
        <Footer />
      </main>
    </>
  );
};

export default Index;
