/**
 * Analyse-Seite
 * Enthält die Klienten-Feldanalyse, Meridian-Diagnose und Frequenz-Output
 * Ausgelagert von der Hauptseite für bessere Performance
 */
import { useState, useCallback } from 'react';
import type { NLSDysregulationData } from '@/components/MeridianDiagnosisPanel';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ClientVectorInterface from '@/components/ClientVectorInterface';
import ClientVectorTrajectory3D from '@/components/ClientVectorTrajectory3D';
import AnatomyResonanceViewer from '@/components/AnatomyResonanceViewer';
import MeridianDiagnosisPanel from '@/components/MeridianDiagnosisPanel';
import FrequencyOutputModule from '@/components/FrequencyOutputModule';
import RealtimeStatusWidget from '@/components/RealtimeStatusWidget';
import TreatmentTrendAnalysis from '@/components/TreatmentTrendAnalysis';
import Footer from '@/components/Footer';
import type { VectorAnalysis } from '@/services/feldengine';
import type { NLSScanConfig } from '@/components/NLSScanConfigPanel';

export interface TreatmentResult {
  beforeDimensions: number[];
  afterDimensions: number[];
  treatmentDuration: number;
  cyclesCompleted: number;
  pointsProcessed: number;
}

const Analyse = () => {
  const [currentVectorAnalysis, setCurrentVectorAnalysis] = useState<VectorAnalysis | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);
  const [treatmentResult, setTreatmentResult] = useState<TreatmentResult | null>(null);
  const [scanConfig, setScanConfig] = useState<NLSScanConfig | null>(null);
  const [nlsDysregulationData, setNlsDysregulationData] = useState<NLSDysregulationData | null>(null);

  const handleVectorCreated = useCallback((analysis: VectorAnalysis) => {
    setCurrentVectorAnalysis(analysis);
  }, []);

  const handleFrequencySelect = useCallback((frequency: number) => {
    setSelectedFrequency(frequency);
  }, []);

  const handleTreatmentComplete = useCallback((result: TreatmentResult) => {
    setTreatmentResult(result);
  }, []);

  const dismissTrendAnalysis = useCallback(() => {
    setTreatmentResult(null);
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

        {/* Trend-Analyse Overlay nach Behandlungsabschluss */}
        <AnimatePresence>
          {treatmentResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10"
                  onClick={dismissTrendAnalysis}
                >
                  <X className="w-4 h-4" />
                </Button>
                <TreatmentTrendAnalysis
                  beforeDimensions={treatmentResult.beforeDimensions}
                  afterDimensions={treatmentResult.afterDimensions}
                  treatmentDuration={treatmentResult.treatmentDuration}
                  cyclesCompleted={treatmentResult.cyclesCompleted}
                  pointsProcessed={treatmentResult.pointsProcessed}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyse-Komponenten */}
        <ClientVectorInterface onVectorCreated={handleVectorCreated} onClientSelected={setSelectedClientId} />
        <ClientVectorTrajectory3D vectorAnalysis={currentVectorAnalysis} />
        <AnatomyResonanceViewer 
          vectorAnalysis={currentVectorAnalysis} 
          onFrequencySelect={handleFrequencySelect}
          onScanConfigChange={setScanConfig}
          onNLSDysregulationData={setNlsDysregulationData}
        />
        <MeridianDiagnosisPanel
          vectorAnalysis={currentVectorAnalysis}
          clientId={selectedClientId || undefined}
          onFrequencySelect={handleFrequencySelect}
          onTreatmentComplete={handleTreatmentComplete}
          nlsDysregulationData={nlsDysregulationData}
        />
        <FrequencyOutputModule />
        
        <Footer />
        <RealtimeStatusWidget />
      </main>
    </>
  );
};

export default Analyse;
