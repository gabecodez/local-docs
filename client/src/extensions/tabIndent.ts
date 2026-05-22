import { Extension } from "@tiptap/core";

export const TabIndent = Extension.create({
  name: "tabIndent",

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.can().sinkListItem("listItem")) {
          return this.editor.chain().focus().sinkListItem("listItem").run();
        }

        return this.editor.commands.insertContent("\t");
      },
      "Shift-Tab": () => {
        if (this.editor.can().liftListItem("listItem")) {
          return this.editor.chain().focus().liftListItem("listItem").run();
        }

        return true;
      },
    };
  },
});
