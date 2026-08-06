import React, { useMemo, useState } from 'react';
import { Button, Input, Tag, TagGroup } from '@fluentui/react-components';
import { Add16Filled, Search20Regular } from '@fluentui/react-icons';
import styles from './MultiSelect.module.css';

/**
 * Searchable multi-select rendered as chips.
 *
 * `allowCustom` matches the product's behaviour for competitor products: you
 * can add something that is not in the catalogue, and it is kept against this
 * customer rather than added to the shared list.
 */
export default function MultiSelect({
  id,
  options = [],
  selected = [],
  onChange,
  placeholder,
  allowCustom = false,
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options
      .filter((o) => !selected.includes(o))
      .filter((o) => (q ? o.toLowerCase().includes(q) : true))
      .slice(0, 6);
  }, [options, selected, query]);

  const exactExists = options.some((o) => o.toLowerCase() === query.trim().toLowerCase());
  const canAddCustom = allowCustom && query.trim() && !exactExists && !selected.includes(query.trim());

  const add = (value) => {
    onChange([...selected, value]);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className={styles.root}>
      <Input
        id={id}
        value={query}
        onChange={(_, d) => {
          setQuery(d.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        contentAfter={<Search20Regular />}
      />

      {open && (matches.length > 0 || canAddCustom) ? (
        <ul className={styles.menu}>
          {matches.map((o) => (
            <li key={o}>
              <button type="button" className={styles.item} onMouseDown={() => add(o)}>
                {o}
              </button>
            </li>
          ))}
          {canAddCustom ? (
            <li>
              <button
                type="button"
                className={`${styles.item} ${styles.custom}`}
                onMouseDown={() => add(query.trim())}
              >
                <Add16Filled aria-hidden="true" />
                Add &ldquo;{query.trim()}&rdquo; for this customer only
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}

      {selected.length > 0 ? (
        <TagGroup
          className={styles.tags}
          onDismiss={(_, d) => onChange(selected.filter((s) => s !== d.value))}
        >
          {selected.map((s) => (
            <Tag key={s} value={s} dismissible size="small" shape="circular">
              {s}
            </Tag>
          ))}
        </TagGroup>
      ) : null}
    </div>
  );
}
