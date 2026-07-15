export type DayLabel = "SEG" | "TER" | "QUA" | "QUI" | "SEX";

export const DAY_LABELS: readonly DayLabel[] = ["SEG", "TER", "QUA", "QUI", "SEX"];

export interface PrintFace1Block {
  day_label: DayLabel;
  title: string;
  synthesis_title: string;
}

export interface PrintFace1 {
  user_label: string;
  context_trail: string[];
  week_label: string;
  date_range: string;
  dominant_result: string;
  definition_of_done: string;
  weekly_contract: { blocks: 5; actions: 15; syntheses: 5 };
  blocks: PrintFace1Block[];
  known_risks: string[];
  qr_token_id: string;
}

export interface PrintFace2Action {
  id: string;
  title: string;
  done_criteria: string;
}

export interface PrintFace2Synthesis {
  id: string;
  title: string;
  completion_rule: "ALL_THREE_ACTIONS_DONE";
}

export interface PrintFace2Day {
  day_label: DayLabel;
  block_title: string;
  method_tag: string | null;
  actions: PrintFace2Action[];
  synthesis: PrintFace2Synthesis;
}

export const RECYCLE_OPTIONS = ["CONTINUE", "REDUCE", "SPLIT", "RECONFIGURE"] as const;
export const CLOSEOUT_FIELDS = ["MAIN_DELIVERY", "BLOCKER", "NEXT_ACTION"] as const;

export interface PrintFace2 {
  project_label: string;
  week_label: string;
  days: PrintFace2Day[];
  recycle_options: typeof RECYCLE_OPTIONS;
  closeout_fields: typeof CLOSEOUT_FIELDS;
  qr_token_id: string;
}

/** ADR-0017 — geometria normativa fixa; nunca configurável por instância. */
export const PRINT_LAYOUT = {
  sheet: "A4_PORTRAIT_210X297_MM",
  zones_mm: {
    top_mechanical: 40,
    face1: 100,
    middle_mechanical: 40,
    face2: 100,
    bottom_mechanical: 17,
  },
  face2_rotation_deg: 180,
  print_sides: "SINGLE_SIDED",
  scale_percent: 100,
  safe_margin_mm: 5,
} as const;

export interface PrintSnapshot {
  schema_version: "1.1.0";
  id: string;
  workspace_id: string;
  plan_version_id: string;
  sprint_id: string;
  state_version_at_emission: number | null;
  created_at: string;
  checksum: string;
  format: "A4_PORTRAIT_FOLDED_WEEKLY_V2";
  layout: typeof PRINT_LAYOUT;
  face1: PrintFace1;
  face2: PrintFace2;
}
