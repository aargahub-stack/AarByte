import Editor, { type OnMount } from "@monaco-editor/react";
import React, { useRef, useMemo } from "react";
import type { editor } from "monaco-editor";
import type { EditorSettings } from "@/types";

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme: "light" | "dark";
  settings: EditorSettings;
};

export const CodeEditor = React.memo(function CodeEditor({
  value,
  onChange,
  language,
  theme,
  settings,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = (ed) => {
    editorRef.current = ed;
  };

  const monacoTheme = theme === "dark" ? "vs-dark" : "light";

  const options = useMemo<editor.IStandaloneEditorConstructionOptions>(() => ({
    fontSize: settings.fontSize,
    tabSize: settings.tabSize,
    wordWrap: settings.wordWrap ? "on" : "off",
    minimap: { enabled: settings.minimap },
    lineNumbers: settings.lineNumbers ? "on" : "off",
    automaticLayout: true,
    scrollBeyondLastLine: false,
    bracketPairColorization: { enabled: true },
    padding: { top: 12, bottom: 12 },
    fontFamily:
      "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Monaco, 'Courier New', monospace",
    fontLigatures: true,
    smoothScrolling: false,
    cursorBlinking: "blink",
    cursorSmoothCaretAnimation: "off",
    renderWhitespace: "selection",
    formatOnPaste: false,
    quickSuggestions: { other: true, comments: false, strings: true },
    suggestOnTriggerCharacters: true,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
  }), [
    settings.fontSize,
    settings.tabSize,
    settings.wordWrap,
    settings.minimap,
    settings.lineNumbers,
  ]);

  return (
    <Editor
      value={value}
      language={language}
      theme={monacoTheme}
      onChange={(v) => onChange(v ?? "")}
      onMount={handleMount}
      options={options}
    />
  );
});

export default CodeEditor;

