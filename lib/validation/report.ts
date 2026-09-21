export const REPORT_REASONS = {
  spam: "Spam o publicidad",
  ofensivo: "Contenido ofensivo o acoso",
  falso: "Información falsa o engañosa",
  otro: "Otro motivo",
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;
