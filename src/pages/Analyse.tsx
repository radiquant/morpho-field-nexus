/**
 * Analyse-Seite
 * Enthält die Klienten-Feldanalyse, Meridian-Diagnose und Frequenz-Output
 * Ausgelagert von der Hauptseite für bessere Performance
 */
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ClientVectorInterface from '@/components/ClientVectorInterface';
import ClientVectorTrajectory3D from '@/components/ClientVectorTrajectory3D';
import AnatomyResonanceViewer from '@/components/AnatomyResonanceViewer';
import MeridianDiagnosisPanel from '@/components/MeridianDiagnosisPanel';
import FrequencyOutputModule from '@/components/FrequencyOutputModule';
import RealtimeStatusWidget from '@/components/RealtimeStatusWidget';
import Footer from '@/components/Footer';
import type { VectorAnalysis } from '@/services/feldengine';

const Analyse = () => {
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
        <title>Klienten-Feldanalyse | Feldengine</title>
        <meta 
          name="description" 
          content="Klienten-Feldanalyse mit Vektor-Berechnung, Meridian-Diagnose nach TCM und Frequenz-Harmonisierung basierend auf René Thoms Katastrophentheorie." 
        />
        <meta name="keywords" content="Feldanalyse, Meridian-Diagnose, TCM, Akupunktur, Frequenztherapie, Vektor-Analyse" />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Header mit Navigation */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Zurück zur Übersicht
              </Button>
            </Link>
            
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <Activity className="w-5 h-5 text-primary" />
              <h1 className="font-display text-lg md:text-xl text-foreground">
                Klienten-<span className="text-gradient-primary">Feldanalyse</span>
              </h1>
            </motion.div>

            <div className="w-[120px]" /> {/* Spacer für Zentrierung */}
          </div>
        </header>

        {/* Analyse-Komponenten */}
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
        
        <Footer />
        <RealtimeStatusWidget />
      </main>
    </>
  );
};

export default Analyse;
