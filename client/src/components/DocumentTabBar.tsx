import { NavLink, useNavigate, useParams } from "react-router-dom";

import { useOpenDocuments } from "../context/OpenDocumentsContext";
import { IconBlankDoc } from "./icons/DocsIcons";

export function DocumentTabBar() {
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const { tabs, createTab, removeTab } = useOpenDocuments();

  if (tabs.length === 0) {
    return null;
  }

  function handleCloseTab(tabId: string) {
    const remaining = tabs.filter((tab) => tab.id !== tabId);
    removeTab(tabId);

    if (tabId !== activeId) {
      return;
    }

    if (remaining.length > 0) {
      navigate(`/doc/${remaining[0]!.id}`);
      return;
    }

    navigate("/");
  }

  return (
    <div className="docs-tab-bar">
      <div className="docs-tab-list">
        {tabs.map((tab) => (
          <div className={tab.id === activeId ? "docs-tab active" : "docs-tab"} key={tab.id}>
            <NavLink className="docs-tab-link" to={`/doc/${tab.id}`}>
              <IconBlankDoc className="docs-tab-icon" />
              <span>{tab.title || "Untitled document"}</span>
            </NavLink>
            <button
              aria-label={`Close ${tab.title}`}
              className="docs-tab-close"
              onClick={() => handleCloseTab(tab.id)}
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        aria-label="New document tab"
        className="docs-tab-new"
        onClick={() => void createTab()}
        type="button"
      >
        +
      </button>
    </div>
  );
}
