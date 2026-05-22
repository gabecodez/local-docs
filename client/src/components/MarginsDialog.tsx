import { useState } from "react";

import type { PageMargins } from "../types/document";
import { DEFAULT_MARGINS } from "../types/document";

interface MarginsDialogProps {
  margins: PageMargins;
  onClose: () => void;
  onSave: (margins: PageMargins) => void;
}

export function MarginsDialog({ margins, onClose, onSave }: MarginsDialogProps) {
  const [draft, setDraft] = useState(margins);

  function updateField(field: keyof PageMargins, value: string) {
    const parsed = Number.parseFloat(value);
    setDraft((current) => ({
      ...current,
      [field]: Number.isFinite(parsed) ? parsed : current[field],
    }));
  }

  function handleReset() {
    setDraft({ ...DEFAULT_MARGINS });
  }

  return (
    <div className="docs-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="docs-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="margins-title"
      >
        <header className="docs-modal-header">
          <h2 id="margins-title">Page margins</h2>
          <button aria-label="Close" className="docs-icon-button" onClick={onClose} type="button">
            ×
          </button>
        </header>

        <div className="docs-modal-body">
          <p className="docs-modal-copy">Set margins in inches for print and page layout.</p>
          <div className="docs-margin-grid">
            {(["top", "right", "bottom", "left"] as const).map((field) => (
              <label className="docs-field" key={field}>
                <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                <input
                  max="4"
                  min="0"
                  onChange={(event) => updateField(field, event.target.value)}
                  step="0.1"
                  type="number"
                  value={draft[field]}
                />
              </label>
            ))}
          </div>
        </div>

        <footer className="docs-modal-footer">
          <button className="docs-secondary-button" onClick={handleReset} type="button">
            Reset
          </button>
          <button className="docs-secondary-button" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="docs-primary-button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            type="button"
          >
            Apply
          </button>
        </footer>
      </div>
    </div>
  );
}
