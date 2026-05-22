import { Link } from "react-router-dom";

import { DocsLogoIcon, IconMenu } from "../icons/DocsIcons";

interface DocsHomeHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function DocsHomeHeader({ searchQuery, onSearchChange }: DocsHomeHeaderProps) {
  return (
    <header className="docs-home-header">
      <div className="docs-home-header-inner">
        <div className="docs-home-header-left">
          <button aria-label="Main menu" className="docs-icon-button" type="button">
            <IconMenu />
          </button>
          <Link className="docs-brand-link" to="/">
            <DocsLogoIcon className="docs-brand-icon" />
            <span className="docs-brand-text">Docs</span>
          </Link>
        </div>

        <label className="docs-search">
          <span className="docs-search-icon" />
          <input
            className="docs-search-input"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search"
            type="search"
            value={searchQuery}
          />
        </label>

        <div className="docs-home-header-right" />
      </div>
    </header>
  );
}
