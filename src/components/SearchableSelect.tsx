import React, { useMemo, useState } from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonIcon
} from '@ionic/react';
import { searchOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
import './SearchableSelect.css';

export interface SearchableOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  options: SearchableOption[];
  placeholder?: string;
  modalTitle?: string;
  disabled?: boolean;
  onChange: (next: string) => void;
}

/**
 * A drop-in replacement for IonSelect that opens a full-screen modal with a
 * live search box and a tappable list. Useful when the option list is long
 * (e.g. TSC, Market, Mulberry Variety) — picking by scroll is painful.
 *
 * Visual style matches our existing form inputs (.details-row / .info-row)
 * so it sits inline without extra CSS in callers.
 */
const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  options,
  placeholder = 'Select',
  modalTitle = 'Select option',
  disabled = false,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedLabel = useMemo(() => {
    const hit = options.find((o) => String(o.value) === String(value));
    return hit?.label || '';
  }, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const openPicker = () => {
    if (disabled) return;
    setQuery('');
    setIsOpen(true);
  };

  const pick = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className={`searchable-select-trigger${disabled ? ' is-disabled' : ''}`}
        onClick={openPicker}
        disabled={disabled}
      >
        <span className={selectedLabel ? 'searchable-select-value' : 'searchable-select-placeholder'}>
          {selectedLabel || placeholder}
        </span>
        <IonIcon icon={searchOutline} />
      </button>

      <IonModal isOpen={isOpen} onDidDismiss={() => setIsOpen(false)}>
        <IonHeader>
          <IonToolbar className="page-toolbar">
            <IonTitle>{modalTitle}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsOpen(false)} fill="clear" aria-label="Close">
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="searchable-select-content">
          <div className="searchable-select-searchbar">
            <IonIcon icon={searchOutline} />
            <input
              autoFocus
              type="text"
              value={query}
              placeholder="Type to filter..."
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="searchable-select-clearbtn"
                aria-label="Clear"
                onClick={() => setQuery('')}
              >
                ×
              </button>
            )}
          </div>

          <div className="searchable-select-list">
            {filtered.length === 0 ? (
              <div className="searchable-select-empty">No matches for "{query}"</div>
            ) : (
              filtered.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`searchable-select-item${isSelected ? ' is-selected' : ''}`}
                    onClick={() => pick(opt.value)}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <IonIcon icon={checkmarkOutline} />}
                  </button>
                );
              })
            )}
          </div>
        </IonContent>
      </IonModal>
    </>
  );
};

export default SearchableSelect;
