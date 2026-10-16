import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Field, TextInput } from '../../components/ui';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export function SearchBox({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text.trim(), 300);
  useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- respond to debounced input only
  }, [debounced]);
  return (
    <Field label={label}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
        <TextInput type="search" className="pl-9" value={text} placeholder={placeholder} maxLength={100} onChange={(e) => setText(e.target.value)} />
      </div>
    </Field>
  );
}
