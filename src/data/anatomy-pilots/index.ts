/**
 * Organ-Schema und Landmark Pilot-Daten
 * Basierend auf BodyParts3D FMA-IDs und GPT-5.4 Ausarbeitung
 * 
 * Koordinatensystem: RAS (Right-Anterior-Superior)
 * Punkte-Klassen: A = Anatomischer Landmark, S = Scan-Punkt, V = Validierung
 */

// ===================== HEART SCHEMA =====================

export const HEART_SCHEMA = {
  organ_code: 'HEART',
  organ_name: 'Heart',
  source_dataset: 'BodyParts3D',
  source_concept_id: 'FMA_7088',
  coordinate_system: 'RAS',
  regions: [
    { region_code: 'APEX', name: 'Apex cordis' },
    { region_code: 'BASE', name: 'Basis cordis' },
    { region_code: 'LV', name: 'Left Ventricle' },
    { region_code: 'RV', name: 'Right Ventricle' },
    { region_code: 'LA', name: 'Left Atrium' },
    { region_code: 'RA', name: 'Right Atrium' },
    { region_code: 'SEPT', name: 'Septum' },
  ],
  point_classes: ['A', 'S', 'V'],
  sampling_config: {
    method: 'region_geodesic_fps',
    min_surface_distance_mm: 8.0,
    target_points_per_region: {
      APEX: 2, BASE: 6, LV: 8, RV: 8, LA: 4, RA: 4, SEPT: 4,
    },
  },
  validation_config: {
    must_be_on_surface: true,
    max_projection_error_mm: 1.0,
    require_unique_labels: true,
    require_region_assignment: true,
  },
  version: 'v1.0',
};

export const HEART_LANDMARKS = [
  // A-Landmarks (anatomische Referenzpunkte)
  {
    point_id: 'HEART_A_001', label: 'Apex cordis', point_class: 'A',
    region_code: 'APEX', structure_concept_id: 'FMA_7088',
    x: 0.02, y: -0.15, z: 0.08,
    scan_frequency: 528, placement_method: 'manual', confidence: 1.0,
    notes: 'Primärer Apex-Referenzpunkt',
  },
  {
    point_id: 'HEART_A_002', label: 'Basis ventral', point_class: 'A',
    region_code: 'BASE', structure_concept_id: 'FMA_7088',
    x: 0.0, y: 0.02, z: 0.1,
    scan_frequency: 528, placement_method: 'manual', confidence: 1.0,
    notes: 'Vorderer Basisanker',
  },
  {
    point_id: 'HEART_A_003', label: 'Basis dorsal', point_class: 'A',
    region_code: 'BASE', structure_concept_id: 'FMA_7088',
    x: 0.0, y: 0.02, z: 0.04,
    scan_frequency: 528, placement_method: 'manual', confidence: 1.0,
    notes: 'Hinterer Basisanker',
  },
  {
    point_id: 'HEART_A_004', label: 'LV lateral max', point_class: 'A',
    region_code: 'LV', structure_concept_id: 'FMA_7101',
    x: 0.05, y: -0.08, z: 0.09,
    scan_frequency: 528, placement_method: 'manual', confidence: 1.0,
    notes: 'Linke Ausdehnung',
  },
  {
    point_id: 'HEART_A_005', label: 'RV lateral max', point_class: 'A',
    region_code: 'RV', structure_concept_id: 'FMA_7098',
    x: -0.04, y: -0.06, z: 0.1,
    scan_frequency: 528, placement_method: 'manual', confidence: 1.0,
    notes: 'Rechte Ausdehnung',
  },
  {
    point_id: 'HEART_A_006', label: 'Septum superior', point_class: 'A',
    region_code: 'SEPT', structure_concept_id: 'FMA_7133',
    x: 0.01, y: -0.02, z: 0.08,
    scan_frequency: 528, placement_method: 'manual', confidence: 1.0,
    notes: 'Septum-Orientierung oben',
  },
  {
    point_id: 'HEART_A_007', label: 'Septum inferior', point_class: 'A',
    region_code: 'SEPT', structure_concept_id: 'FMA_7133',
    x: 0.01, y: -0.12, z: 0.08,
    scan_frequency: 528, placement_method: 'manual', confidence: 1.0,
    notes: 'Septum-Orientierung unten',
  },
  {
    point_id: 'HEART_A_008', label: 'Aortenwurzel', point_class: 'A',
    region_code: 'BASE', structure_concept_id: 'FMA_3740',
    x: 0.01, y: 0.04, z: 0.08,
    scan_frequency: 528, placement_method: 'manual', confidence: 1.0,
    notes: 'Gefäßreferenz Aorta',
  },
  {
    point_id: 'HEART_A_009', label: 'Truncus pulmonalis', point_class: 'A',
    region_code: 'BASE', structure_concept_id: 'FMA_8612',
    x: -0.02, y: 0.03, z: 0.1,
    scan_frequency: 528, placement_method: 'manual', confidence: 1.0,
    notes: 'Gefäßreferenz Pulmonalarterie',
  },
  // S-Punkte (Scan-Punkte) — repräsentative Auswahl pro Region
  {
    point_id: 'HEART_S_001', label: 'LV anterior', point_class: 'S',
    region_code: 'LV', structure_concept_id: 'FMA_7101',
    x: 0.04, y: -0.06, z: 0.11,
    scan_frequency: 528, placement_method: 'sampled', confidence: 0.9,
  },
  {
    point_id: 'HEART_S_002', label: 'LV posterior', point_class: 'S',
    region_code: 'LV', structure_concept_id: 'FMA_7101',
    x: 0.04, y: -0.06, z: 0.06,
    scan_frequency: 528, placement_method: 'sampled', confidence: 0.9,
  },
  {
    point_id: 'HEART_S_003', label: 'LV inferior', point_class: 'S',
    region_code: 'LV', structure_concept_id: 'FMA_7101',
    x: 0.035, y: -0.12, z: 0.085,
    scan_frequency: 528, placement_method: 'sampled', confidence: 0.9,
  },
  {
    point_id: 'HEART_S_004', label: 'RV anterior', point_class: 'S',
    region_code: 'RV', structure_concept_id: 'FMA_7098',
    x: -0.03, y: -0.05, z: 0.12,
    scan_frequency: 528, placement_method: 'sampled', confidence: 0.9,
  },
  {
    point_id: 'HEART_S_005', label: 'RV inferior', point_class: 'S',
    region_code: 'RV', structure_concept_id: 'FMA_7098',
    x: -0.025, y: -0.1, z: 0.09,
    scan_frequency: 528, placement_method: 'sampled', confidence: 0.9,
  },
  {
    point_id: 'HEART_S_006', label: 'LA superior', point_class: 'S',
    region_code: 'LA', structure_concept_id: 'FMA_7097',
    x: 0.03, y: 0.0, z: 0.06,
    scan_frequency: 528, placement_method: 'sampled', confidence: 0.9,
  },
  {
    point_id: 'HEART_S_007', label: 'RA superior', point_class: 'S',
    region_code: 'RA', structure_concept_id: 'FMA_7096',
    x: -0.03, y: 0.0, z: 0.07,
    scan_frequency: 528, placement_method: 'sampled', confidence: 0.9,
  },
  {
    point_id: 'HEART_S_008', label: 'Apex lateral', point_class: 'S',
    region_code: 'APEX', structure_concept_id: 'FMA_7088',
    x: 0.03, y: -0.14, z: 0.09,
    scan_frequency: 528, placement_method: 'sampled', confidence: 0.9,
  },
];

// ===================== BRAIN SCHEMA =====================

export const BRAIN_SCHEMA = {
  organ_code: 'BRAIN',
  organ_name: 'Brain',
  source_dataset: 'BodyParts3D',
  source_concept_id: 'FMA_50801',
  coordinate_system: 'RAS',
  regions: [
    { region_code: 'LFRONT', name: 'Left Frontal Lobe' },
    { region_code: 'RFRONT', name: 'Right Frontal Lobe' },
    { region_code: 'LPARI', name: 'Left Parietal Lobe' },
    { region_code: 'RPARI', name: 'Right Parietal Lobe' },
    { region_code: 'LTEMP', name: 'Left Temporal Lobe' },
    { region_code: 'RTEMP', name: 'Right Temporal Lobe' },
    { region_code: 'LOCC', name: 'Left Occipital Lobe' },
    { region_code: 'ROCC', name: 'Right Occipital Lobe' },
    { region_code: 'LCEREB', name: 'Left Cerebellum' },
    { region_code: 'RCEREB', name: 'Right Cerebellum' },
    { region_code: 'BRAINSTEM', name: 'Brainstem' },
    { region_code: 'MIDLINE', name: 'Midline' },
  ],
  point_classes: ['A', 'S', 'V'],
  sampling_config: {
    method: 'region_geodesic_fps',
    min_surface_distance_mm: 6.0,
    target_points_per_region: {
      LFRONT: 4, RFRONT: 4, LPARI: 4, RPARI: 4,
      LTEMP: 4, RTEMP: 4, LOCC: 3, ROCC: 3,
      LCEREB: 4, RCEREB: 4, BRAINSTEM: 3, MIDLINE: 3,
    },
  },
  validation_config: {
    must_be_on_surface: true,
    max_projection_error_mm: 1.0,
    require_unique_labels: true,
    require_region_assignment: true,
    mirror_symmetry: { plane: 'sagittal', tolerance_mm: 2.0 },
  },
  version: 'v1.0',
};

export const BRAIN_LANDMARKS = [
  // A-Landmarks (anatomische Referenzpunkte)
  {
    point_id: 'BRAIN_A_001', label: 'Left frontal pole', point_class: 'A',
    region_code: 'LFRONT', structure_concept_id: 'FMA_74886',
    x: 0.03, y: 0.55, z: 0.08,
    scan_frequency: 40, placement_method: 'manual', confidence: 1.0,
    mirror_pair: 'BRAIN_A_002',
    notes: 'Anteriorer Referenzpunkt links',
  },
  {
    point_id: 'BRAIN_A_002', label: 'Right frontal pole', point_class: 'A',
    region_code: 'RFRONT', structure_concept_id: 'FMA_74886',
    x: -0.03, y: 0.55, z: 0.08,
    scan_frequency: 40, placement_method: 'mirrored', confidence: 1.0,
    mirror_pair: 'BRAIN_A_001',
    notes: 'Anteriorer Referenzpunkt rechts',
  },
  {
    point_id: 'BRAIN_A_003', label: 'Left occipital pole', point_class: 'A',
    region_code: 'LOCC', structure_concept_id: 'FMA_67325',
    x: 0.02, y: 0.38, z: -0.02,
    scan_frequency: 40, placement_method: 'manual', confidence: 1.0,
    mirror_pair: 'BRAIN_A_004',
    notes: 'Posteriorer Referenzpunkt links',
  },
  {
    point_id: 'BRAIN_A_004', label: 'Right occipital pole', point_class: 'A',
    region_code: 'ROCC', structure_concept_id: 'FMA_67325',
    x: -0.02, y: 0.38, z: -0.02,
    scan_frequency: 40, placement_method: 'mirrored', confidence: 1.0,
    mirror_pair: 'BRAIN_A_003',
    notes: 'Posteriorer Referenzpunkt rechts',
  },
  {
    point_id: 'BRAIN_A_005', label: 'Vertex superior', point_class: 'A',
    region_code: 'MIDLINE', structure_concept_id: 'FMA_50801',
    x: 0.0, y: 0.58, z: 0.06,
    scan_frequency: 40, placement_method: 'manual', confidence: 1.0,
    notes: 'Oberer Hauptanker (Scheitel)',
  },
  {
    point_id: 'BRAIN_A_006', label: 'Inferior mid ref', point_class: 'A',
    region_code: 'MIDLINE', structure_concept_id: 'FMA_50801',
    x: 0.0, y: 0.42, z: 0.0,
    scan_frequency: 40, placement_method: 'manual', confidence: 1.0,
    notes: 'Unterer Hauptanker',
  },
  {
    point_id: 'BRAIN_A_007', label: 'Cerebellum mid', point_class: 'A',
    region_code: 'MIDLINE', structure_concept_id: 'FMA_67944',
    x: 0.0, y: 0.4, z: -0.03,
    scan_frequency: 40, placement_method: 'manual', confidence: 1.0,
    notes: 'Kleinhirn-Anker Mittellinie',
  },
  {
    point_id: 'BRAIN_A_008', label: 'Brainstem ventral', point_class: 'A',
    region_code: 'BRAINSTEM', structure_concept_id: 'FMA_79876',
    x: 0.0, y: 0.4, z: 0.02,
    scan_frequency: 40, placement_method: 'manual', confidence: 1.0,
    notes: 'Hirnstamm-Anker ventral',
  },
  // S-Punkte (Scan-Punkte) — repräsentative Auswahl
  {
    point_id: 'BRAIN_S_001', label: 'L frontal sup', point_class: 'S',
    region_code: 'LFRONT', structure_concept_id: 'FMA_74886',
    x: 0.03, y: 0.54, z: 0.1,
    scan_frequency: 40, placement_method: 'sampled', confidence: 0.9,
    mirror_pair: 'BRAIN_S_002',
  },
  {
    point_id: 'BRAIN_S_002', label: 'R frontal sup', point_class: 'S',
    region_code: 'RFRONT', structure_concept_id: 'FMA_74886',
    x: -0.03, y: 0.54, z: 0.1,
    scan_frequency: 40, placement_method: 'mirrored', confidence: 0.9,
    mirror_pair: 'BRAIN_S_001',
  },
  {
    point_id: 'BRAIN_S_003', label: 'L parietal lat', point_class: 'S',
    region_code: 'LPARI', structure_concept_id: 'FMA_74888',
    x: 0.05, y: 0.5, z: 0.06,
    scan_frequency: 40, placement_method: 'sampled', confidence: 0.9,
    mirror_pair: 'BRAIN_S_004',
  },
  {
    point_id: 'BRAIN_S_004', label: 'R parietal lat', point_class: 'S',
    region_code: 'RPARI', structure_concept_id: 'FMA_74888',
    x: -0.05, y: 0.5, z: 0.06,
    scan_frequency: 40, placement_method: 'mirrored', confidence: 0.9,
    mirror_pair: 'BRAIN_S_003',
  },
  {
    point_id: 'BRAIN_S_005', label: 'L temporal lat', point_class: 'S',
    region_code: 'LTEMP', structure_concept_id: 'FMA_74887',
    x: 0.06, y: 0.46, z: 0.04,
    scan_frequency: 40, placement_method: 'sampled', confidence: 0.9,
    mirror_pair: 'BRAIN_S_006',
  },
  {
    point_id: 'BRAIN_S_006', label: 'R temporal lat', point_class: 'S',
    region_code: 'RTEMP', structure_concept_id: 'FMA_74887',
    x: -0.06, y: 0.46, z: 0.04,
    scan_frequency: 40, placement_method: 'mirrored', confidence: 0.9,
    mirror_pair: 'BRAIN_S_005',
  },
  {
    point_id: 'BRAIN_S_007', label: 'L cerebellum lat', point_class: 'S',
    region_code: 'LCEREB', structure_concept_id: 'FMA_67944',
    x: 0.03, y: 0.39, z: -0.03,
    scan_frequency: 40, placement_method: 'sampled', confidence: 0.9,
    mirror_pair: 'BRAIN_S_008',
  },
  {
    point_id: 'BRAIN_S_008', label: 'R cerebellum lat', point_class: 'S',
    region_code: 'RCEREB', structure_concept_id: 'FMA_67944',
    x: -0.03, y: 0.39, z: -0.03,
    scan_frequency: 40, placement_method: 'mirrored', confidence: 0.9,
    mirror_pair: 'BRAIN_S_007',
  },
  {
    point_id: 'BRAIN_S_009', label: 'Brainstem dorsal', point_class: 'S',
    region_code: 'BRAINSTEM', structure_concept_id: 'FMA_79876',
    x: 0.0, y: 0.41, z: -0.01,
    scan_frequency: 40, placement_method: 'sampled', confidence: 0.9,
  },
];

// ===================== PILOT MANIFEST =====================

export const PILOT_MANIFEST = {
  version: 'v1.0',
  created: '2026-03-08',
  source: 'BodyParts3D / GPT-5.4 Pilot',
  organs: [
    {
      organ_code: 'HEART',
      a_landmarks: HEART_LANDMARKS.filter(p => p.point_class === 'A').length,
      s_points: HEART_LANDMARKS.filter(p => p.point_class === 'S').length,
      total: HEART_LANDMARKS.length,
      regions: HEART_SCHEMA.regions.length,
    },
    {
      organ_code: 'BRAIN',
      a_landmarks: BRAIN_LANDMARKS.filter(p => p.point_class === 'A').length,
      s_points: BRAIN_LANDMARKS.filter(p => p.point_class === 'S').length,
      total: BRAIN_LANDMARKS.length,
      regions: BRAIN_SCHEMA.regions.length,
    },
  ],
};
