import { Navigate, Route, Routes } from "react-router-dom";

import { OpenDocumentsProvider } from "./context/OpenDocumentsContext";
import { DocumentEditorPage } from "./pages/DocumentEditorPage";
import { HomePage } from "./pages/HomePage";

export function App() {
  return (
    <OpenDocumentsProvider>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="doc/:id" element={<DocumentEditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </OpenDocumentsProvider>
  );
}
