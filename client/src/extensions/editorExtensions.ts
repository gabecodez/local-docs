import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";

import { FontSize } from "../extensions/fontSize";
import { TabIndent } from "../extensions/tabIndent";

export function createEditorExtensions() {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    TextStyle,
    FontFamily.configure({
      types: ["textStyle"],
    }),
    FontSize,
    Color.configure({
      types: ["textStyle"],
    }),
    Highlight.configure({
      multicolor: true,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
    }),
    Placeholder.configure({
      placeholder: "Start writing...",
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    TabIndent,
  ];
}

export const FONT_FAMILIES = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Times New Roman", value: '"Times New Roman", serif' },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: '"Courier New", monospace' },
  { label: "Comic Sans MS", value: '"Comic Sans MS", cursive' },
];

export const FONT_SIZES = ["8", "9", "10", "11", "12", "14", "16", "18", "24", "36"];

export const HIGHLIGHT_COLORS = [
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#ff00ff",
  "#ff0000",
  "#0000ff",
  "#fce5cd",
  "#d9ead3",
  "#cfe2f3",
  "#ffffff",
];

export const TEXT_COLORS = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#b7b7b7",
  "#cccccc",
  "#980000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
];
