import { useState, useCallback } from 'react';
import Hero from "@/components/Hero";
import ConceptSection from "@/components/ConceptSection";
import CuspVisualization from "@/components/CuspVisualization";
import CuspSurface3D from "@/components/CuspSurface3D";
import FrequencyTherapySection from "@/components/FrequencyTherapySection";
import SystemStatusDashboard from "@/components/SystemStatusDashboard";
import ClientVectorInterface from "@/components/ClientVectorInterface";
import ClientVectorTrajectory3D from "@/components/ClientVectorTrajectory3D";
import AnatomyResonanceViewer from "@/components/AnatomyResonanceViewer";
import MeridianDiagnosisPanel from "@/components/MeridianDiagnosisPanel";
import FrequencyOutputModule from "@/components/FrequencyOutputModule";
import RealtimeStatusWidget from "@/components/RealtimeStatusWidget";
import ThomResources from "@/components/ThomResources";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import type { VectorAnalysis } from '@/services/feldengine';

const Index = () => {
  const [currentVectorAnalysis, setCurrentVectorAnalysis] = useState<VectorAnalysis | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);

  const handleVectorCreated = useCallback((analysis: VectorAnalysis) => {
    setCurrentVectorAnalysis(analysis);
  }, []);

  const handleFrequencySelect = useCallback((frequency: number) => {
    setSelectedFrequency(frequency);
  }, []);

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
        <CuspVisualization />
        <CuspSurface3D />
        <FrequencyTherapySection />
        <ClientVectorInterface onVectorCreated={handleVectorCreated} />
        <ClientVectorTrajectory3D vectorAnalysis={currentVectorAnalysis} />
        <AnatomyResonanceViewer 
          vectorAnalysis={currentVectorAnalysis} 
          onFrequencySelect={handleFrequencySelect}
        />
        <MeridianDiagnosisPanel
          vectorAnalysis={currentVectorAnalysis}
          onFrequencySelect={handleFrequencySelect}
        />
        <FrequencyOutputModule />
        <section id="ressourcen">
          <ThomResources />
        </section>
        <SystemStatusDashboard />
        <Footer />
        <RealtimeStatusWidget />
      </main>
    </>
  );
};

export default Index;
