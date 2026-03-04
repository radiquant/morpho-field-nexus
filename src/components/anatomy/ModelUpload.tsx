/**
 * GLB-Modell Upload-Komponente
 * Ermöglicht das Hochladen von GLB-Dateien in den 3d-models Storage-Bucket
 * und registriert sie in der anatomy_models Tabelle
 */
import { useState, useRef } from 'react';
import { Upload, FileUp, Check, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as tus from 'tus-js-client';

interface ModelUploadProps {
  onUploadComplete?: () => void;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function ModelUpload({ onUploadComplete }: ModelUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('full_body');
  const [source, setSource] = useState('custom');
  const [gender, setGender] = useState('neutral');
  const [supportsMeridians, setSupportsMeridians] = useState(false);
  const [supportsOrgans, setSupportsOrgans] = useState(false);
  const [dracoCompressed, setDracoCompressed] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      toast.error('Nur GLB/GLTF-Dateien werden unterstützt');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Datei zu groß (max. ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
      return;
    }

    setSelectedFile(file);
    if (!name) {
      setName(file.name.replace(/\.(glb|gltf)$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !name) {
      toast.error('Bitte Name und Datei angeben');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // 1. Upload to storage
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const storagePath = fileName;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('3d-models')
        .upload(storagePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setUploadProgress(70);

      // 2. Register in database
      const { error: dbError } = await supabase.from('anatomy_models').insert({
        name,
        description: description || null,
        source,
        category,
        gender,
        file_path: `3d-models/${storagePath}`,
        storage_type: 'cloud',
        file_size_bytes: selectedFile.size,
        supports_meridian_mapping: supportsMeridians,
        supports_organ_layers: supportsOrgans,
        draco_compressed: dracoCompressed,
        body_height_normalized: false,
        license: source === 'z-anatomy' ? 'CC-BY-SA-4.0' : source === 'bodyparts3d' ? 'CC-BY-SA-2.1-JP' : 'Custom',
        is_default: false,
        sort_order: 50,
      });

      if (dbError) throw dbError;

      setUploadProgress(100);
      toast.success(`Modell "${name}" erfolgreich hochgeladen`);

      // Reset
      setSelectedFile(null);
      setName('');
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      onUploadComplete?.();
    } catch (err: any) {
      console.error('Upload-Fehler:', err);
      toast.error(`Upload fehlgeschlagen: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Modell hochladen</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs gap-1 h-7"
        >
          <Info className="w-3 h-3" />
          Anleitung
        </Button>
      </div>

      {/* Blender Export-Anleitung */}
      {showGuide && (
        <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-2 border border-border">
          <p className="font-semibold text-foreground">Z-Anatomy → GLB Export-Workflow:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
            <li>
              <strong>Blender-Datei herunterladen:</strong>
              <br />
              <a
                href="https://github.com/Z-Anatomy/The-blend"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                GitHub: Z-Anatomy/The-blend <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
            <li>
              <strong>In Blender öffnen</strong> (v3.0+) → gewünschte Layer aktivieren
            </li>
            <li>
              <strong>Nicht benötigte Objekte löschen</strong> (z.B. nur Skeleton + Skin behalten für kompaktes Modell)
            </li>
            <li>
              <strong>Draco-Kompression aktivieren:</strong>
              <br />
              File → Export → glTF 2.0 (.glb) → ☑ Draco Compression
            </li>
            <li>
              <strong>Einstellungen:</strong>
              <br />
              Format: GLB | Apply Modifiers: ✓ | Compression Level: 6
            </li>
            <li>
              <strong>Hier hochladen</strong> und Kategorie/Quelle angeben
            </li>
          </ol>
          <div className="pt-1 border-t border-border mt-2">
            <p className="text-muted-foreground">
              <strong>Weitere Quellen:</strong>
            </p>
            <div className="flex flex-col gap-1 mt-1">
              <a
                href="https://lifesciencedb.jp/bp3d/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                BodyParts3D (RIKEN) <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="https://sketchfab.com/search?q=human+anatomy&type=models&licenses=by&licenses=by-sa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                Sketchfab Medical (CC-BY) <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* File Input */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="w-full gap-2 text-xs"
          disabled={isUploading}
        >
          <FileUp className="w-3.5 h-3.5" />
          {selectedFile ? selectedFile.name : 'GLB-Datei auswählen'}
        </Button>
        {selectedFile && (
          <p className="text-[10px] text-muted-foreground mt-1">
            {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
          </p>
        )}
      </div>

      {selectedFile && (
        <>
          {/* Name */}
          <div className="space-y-1">
            <Label className="text-xs">Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Z-Anatomy Vollkörper männlich"
              className="h-8 text-xs"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs">Beschreibung</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optionale Beschreibung des Modells..."
              className="text-xs min-h-[50px]"
            />
          </div>

          {/* Category & Source */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Kategorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_body">Ganzkörper</SelectItem>
                  <SelectItem value="organ">Organ</SelectItem>
                  <SelectItem value="skeleton">Skelett/Muskulatur</SelectItem>
                  <SelectItem value="meridian_template">Meridian-Schablone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Quelle</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="z-anatomy">Z-Anatomy</SelectItem>
                  <SelectItem value="bodyparts3d">BodyParts3D</SelectItem>
                  <SelectItem value="sketchfab">Sketchfab</SelectItem>
                  <SelectItem value="custom">Eigenes Modell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <Label className="text-xs">Geschlecht</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="male">Männlich</SelectItem>
                <SelectItem value="female">Weiblich</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Meridian-Mapping</Label>
              <Switch checked={supportsMeridians} onCheckedChange={setSupportsMeridians} className="scale-75" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Organ-Layer</Label>
              <Switch checked={supportsOrgans} onCheckedChange={setSupportsOrgans} className="scale-75" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Draco-komprimiert</Label>
              <Switch checked={dracoCompressed} onCheckedChange={setDracoCompressed} className="scale-75" />
            </div>
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading || !name}
            className="w-full gap-2 text-xs"
          >
            {isUploading ? (
              <>
                <div className="animate-spin w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Modell hochladen
              </>
            )}
          </Button>

          {isUploading && (
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ModelUpload;
