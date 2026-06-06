import { UIBlockConfig } from './theme-config';

export type TemplatePreset = string;

export interface TemplatePresetInfo {
  id: string;
  name: string;
  description: string;
  preview?: string;
  blocks: UIBlockConfig[];
}

export const TEMPLATE_PRESETS: Record<string, TemplatePresetInfo> = {};

export function getTemplatePreset(presetId: string): TemplatePresetInfo | null {
  return TEMPLATE_PRESETS[presetId] ?? null;
}

export function getAllTemplatePresets(): TemplatePresetInfo[] {
  return Object.values(TEMPLATE_PRESETS);
}
