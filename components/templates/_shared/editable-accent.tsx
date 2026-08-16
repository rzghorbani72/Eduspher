import type { SectionConfig } from './types';

interface EditableAccentProps {
  config?: SectionConfig;
  fieldKey?: string;
  colorKey?: string;
  className?: string;
  children: React.ReactNode;
}

/** Highlighted inline span — editable text + optional per-span accent color. */
export function EditableAccent({
  config,
  fieldKey = 'titleEm',
  colorKey = 'titleEmColor',
  className = '',
  children,
}: EditableAccentProps) {
  const custom =
    typeof config?.[colorKey] === 'string' && String(config[colorKey]).trim()
      ? String(config[colorKey])
      : null;

  return (
    <em
      data-editable={fieldKey}
      data-accent-color-field={colorKey}
      className={`not-italic ${custom ? '' : 'text-(--theme-primary)'} ${className}`.trim()}
      style={custom ? { color: custom } : undefined}
    >
      {children}
    </em>
  );
}
