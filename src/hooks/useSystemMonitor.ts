// React Hook für System-Monitoring
import { useState, useEffect, useCallback } from 'react';
import type { ServerHardware, SystemMetrics } from '@/types/hardware';
import { systemMonitor } from '@/services/hardware/SystemMonitorService';

interface UseSystemMonitorReturn {
  serverConfig: ServerHardware;
  currentMetrics: SystemMetrics | null;
  isMonitoring: boolean;
  startMonitoring: (intervalMs?: number) => void;
  stopMonitoring: () => void;
  measureWebSocketLatency: (wsUrl: string) => Promise<number>;
  measureNetworkLatency: (endpoint: string) => Promise<number>;
}

export function useSystemMonitor(): UseSystemMonitorReturn {
  const [currentMetrics, setCurrentMetrics] = useState<SystemMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Metriken-Handler
  const handleMetrics = useCallback((metrics: SystemMetrics) => {
    setCurrentMetrics(metrics);
  }, []);

  // Listener registrieren
  useEffect(() => {
    systemMonitor.addMetricsListener(handleMetrics);
    
    // Initiale Metriken abrufen
    const initial = systemMonitor.getCurrentMetrics();
    if (initial) {
      setCurrentMetrics(initial);
    }

    return () => {
      systemMonitor.removeMetricsListener(handleMetrics);
    };
  }, [handleMetrics]);

  // Monitoring starten
  const startMonitoring = useCallback((intervalMs: number = 1000) => {
    systemMonitor.start(intervalMs);
    setIsMonitoring(true);
  }, []);

  // Monitoring stoppen
  const stopMonitoring = useCallback(() => {
    systemMonitor.stop();
    setIsMonitoring(false);
  }, []);

  // WebSocket-Latenz messen
  const measureWebSocketLatency = useCallback(async (wsUrl: string): Promise<number> => {
    return systemMonitor.measureWebSocketLatency(wsUrl);
  }, []);

  // Netzwerk-Latenz messen
  const measureNetworkLatency = useCallback(async (endpoint: string): Promise<number> => {
    return systemMonitor.measureNetworkLatency(endpoint);
  }, []);

  return {
    serverConfig: systemMonitor.getServerConfig(),
    currentMetrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    measureWebSocketLatency,
    measureNetworkLatency,
  };
}
