export interface AIMessage {
  role: "user" | "assistant";
  text: string;
  image?: string;
}

export interface AIRecommendation {
  label: string;
  reason: string;
  options: string[];
  quantity: number | null;
  unit: string | null;
  unavailable: boolean;
}

export type AIStreamEvent =
  | { type: "delta"; text: string }
  | { type: "phase"; phase: "recommendations" }
  | { type: "recommendations"; items: AIRecommendation[] }
  | { type: "done" }
  | { type: "error"; message: string };

export interface AIStatus {
  ready: boolean;
  provider?: string;
}

export interface Identification {
  status: "identified" | "not_building" | "uncertain";
  name: string;
  description: string;
  confidence: "high" | "medium" | "low";
  observations: string[];
  questions: string[];
  productIds: string[];
}
