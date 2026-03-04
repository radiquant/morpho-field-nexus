/**
 * 3D-Modell-Auswahl Komponente
 * Zeigt verfügbare Anatomie-Modelle gruppiert nach Kategorie
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Download, Check, Lock, Layers, GitBranch, Bone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type AnatomyModel,
  getCategoryLabel,
  getSourceLabel,
} from '@/hooks/useAnatomyModels';

interface ModelSelectorProps {
  models: AnatomyModel[];
  selectedModel: AnatomyModel | null;
  onSelect: (model: AnatomyModel) => void;
  categories: string[];
  isLoading?: boolean;
}

const CATEGORY_ICONS: Record<string, typeof Heart> = {
  full_body: Layers,
  organ: Heart,
  skeleton: Bone,
  meridian_template: GitBranch,
};

export function ModelSelector({
  models,
  selectedModel,
  onSelect,
  categories,
  isLoading,
}: ModelSelectorProps) {
  const [activeTab, setActiveTab] = useState(categories[0] || 'full_body');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Box className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">3D-Modell Bibliothek</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 h-8">
          {categories.map(cat => {
            const Icon = CATEGORY_ICONS[cat] || Box;
            return (
              <TabsTrigger key={cat} value={cat} className="text-[10px] px-1 gap-1">
                <Icon className="w-3 h-3" />
                {getCategoryLabel(cat).split(' ')[0]}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-2 space-y-2">
            <AnimatePresence mode="popLayout">
              {models
                .filter(m => m.category === cat)
                .map(model => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    isSelected={selectedModel?.id === model.id}
                    onSelect={() => onSelect(model)}
                  />
                ))}
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ModelCard({
  model,
  isSelected,
  onSelect,
}: {
  model: AnatomyModel;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <button
        onClick={onSelect}
        disabled={!model.isAvailable}
        className={`w-full text-left p-2.5 rounded-lg border transition-all ${
          isSelected
            ? 'border-primary bg-primary/10 shadow-sm'
            : model.isAvailable
            ? 'border-border bg-card hover:border-primary/40 hover:bg-muted/50'
            : 'border-border/50 bg-muted/30 opacity-60 cursor-not-allowed'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-foreground truncate">
                {model.name}
              </span>
              {isSelected && <Check className="w-3 h-3 text-primary shrink-0" />}
              {!model.isAvailable && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
            </div>
            
            {model.description && (
              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                {model.description}
              </p>
            )}

            <div className="flex flex-wrap gap-1 mt-1.5">
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                {getSourceLabel(model.source)}
              </Badge>
              {model.gender !== 'neutral' && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                  {model.gender === 'male' ? '♂' : '♀'}
                </Badge>
              )}
              {model.supportsMeridianMapping && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                  Meridiane
                </Badge>
              )}
              {model.supportsOrganLayers && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                  Organe
                </Badge>
              )}
              {model.dracoCompressed && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                  Draco
                </Badge>
              )}
            </div>
          </div>

          {!model.isAvailable && (
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" disabled>
              <Download className="w-3 h-3" />
            </Button>
          )}
        </div>

        {model.license && (
          <p className="text-[9px] text-muted-foreground/60 mt-1">
            Lizenz: {model.license}
          </p>
        )}
      </button>
    </motion.div>
  );
}

export default ModelSelector;
