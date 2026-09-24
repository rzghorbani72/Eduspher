'use client';

import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  children: ReactNode;
};

type OptionData = {
  value: string;
  label: string;
  disabled: boolean;
};

function readOptions(children: ReactNode): OptionData[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child) || child.type !== 'option') return [];
    const el = child as ReactElement<{
      value?: string | number;
      disabled?: boolean;
      children?: ReactNode;
    }>;
    return [
      {
        value: String(el.props.value ?? ''),
        label: String(el.props.children ?? ''),
        disabled: Boolean(el.props.disabled),
      },
    ];
  });
}

/**
 * Soft themed select. Native `<option>` children keep the same call sites, but
 * the open menu is custom so it is not the browser's blue OS popup.
 */
export function Select({
  className,
  children,
  value,
  defaultValue,
  onChange,
  disabled,
  required,
  name,
  id,
  'aria-label': ariaLabel,
  ...rest
}: SelectProps) {
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  const options = useMemo(() => readOptions(children), [children]);
  const stringValue = value === undefined || value === null ? undefined : String(value);
  const [internal, setInternal] = useState(() => String(defaultValue ?? options[0]?.value ?? ''));
  const current = stringValue ?? internal;
  const selected = options.find((option) => option.value === current) ?? options[0];

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const place = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPanelStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 80,
      });
    };

    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  const emit = (next: string) => {
    if (stringValue === undefined) setInternal(next);
    onChange?.({
      target: { value: next, name: name ?? '' },
      currentTarget: { value: next, name: name ?? '' },
    } as ChangeEvent<HTMLSelectElement>);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((prev) => !prev);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const enabled = options.filter((option) => !option.disabled);
      const index = enabled.findIndex((option) => option.value === current);
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next = enabled[(index + delta + enabled.length) % enabled.length];
      if (next) emit(next.value);
    }
  };

  return (
    <div className={cn('relative min-w-0', className)}>
      {/* Keeps native form validation (`required`) working. */}
      <select
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        name={name}
        id={id}
        required={required}
        disabled={disabled}
        value={current}
        onChange={() => undefined}
        {...rest}
      >
        {options.map((option) => (
          <option
            key={`${option.value}-${option.label}`}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={onKeyDown}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-(--theme-foreground)/10',
          'bg-(--theme-background)/70 ps-3.5 pe-3 text-start text-sm text-(--theme-foreground)',
          'transition-colors focus-visible:border-(--theme-primary) focus-visible:ring-2',
          'focus-visible:ring-(--theme-primary)/15 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          open && 'border-(--theme-primary) ring-2 ring-(--theme-primary)/15',
        )}
      >
        <span className={cn('min-w-0 flex-1 truncate', !selected?.value && 'text-muted')}>
          {selected?.label || '—'}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-(--theme-foreground)/35 transition-transform',
            open && 'rotate-180',
          )}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>

      {typeof document !== 'undefined' && open
        ? createPortal(
            <div
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label={ariaLabel}
              style={panelStyle}
              className={cn(
                'overflow-hidden rounded-xl border border-(--theme-foreground)/8',
                'bg-(--theme-card-bg) py-1.5 shadow-[0_12px_32px_-16px_rgba(16,20,28,0.28)]',
              )}
            >
              <ul className="max-h-60 overflow-auto px-1.5">
                {options.map((option) => {
                  const isActive = option.value === current;
                  return (
                    <li key={`${option.value}-${option.label}`} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        disabled={option.disabled}
                        onClick={() => emit(option.value)}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-start text-sm transition-colors',
                          'disabled:cursor-not-allowed disabled:opacity-40',
                          isActive
                            ? 'bg-(--theme-primary)/12 font-medium text-(--theme-primary-ink)'
                            : 'text-(--theme-foreground) hover:bg-(--theme-primary)/8',
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                        {isActive ? (
                          <Check
                            className="size-4 shrink-0 text-(--theme-primary-ink)"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
