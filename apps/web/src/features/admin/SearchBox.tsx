import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Field, TextInput } from '../../components/ui';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export function SearchBox({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text.trim(), 300);
  useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- respond to debounced input only
  }, [debounced]);
  return (
    <Field label={label}>
      <TextInput
        type="search"
        leadingIcon={<Search />}
        value={text}
        placeholder={placeholder}
        maxLength={100}
        onChange={(e) => setText(e.target.value)}
      />
    </Field>
  );
}
