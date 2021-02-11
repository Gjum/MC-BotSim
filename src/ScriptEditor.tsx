import MonacoEditor, { Monaco } from "@monaco-editor/react";
import raw from "raw.macro";

export function ScriptEditor({
  script,
  onChange,
}: {
  script: string;
  onChange?: (content?: string) => void;
}) {
  return (
    <MonacoEditor
      height="100%"
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        renderWhitespace: "boundary",
        wordWrap: "on",
      }}
      value={script}
      onChange={onChange}
      defaultLanguage="javascript"
      defaultPath="./scripts/live.js"
      loading={"Loading script editor..."}
      beforeMount={(m) => {
        addLibs(m);
      }}
    />
  );
}

/** All files under ./api/ to be loaded into the editor (`addExtraLib`). */
const apiFiles = [
  "Bot.ts",
  "botHelpers.ts",
  "CancelToken.ts",
  "Environment.ts",
  "Look.ts",
  "Vec3.ts",
  "Window.ts",
];
const readApiFile = (fileName: string) => raw(`./api/${fileName}`);

function addLibs(monaco: Monaco) {
  const { javascriptDefaults } = monaco.languages.typescript;
  javascriptDefaults.setCompilerOptions({
    allowJs: true,
    strict: true,
  });
  for (const fileName of apiFiles) {
    const content = readApiFile(fileName);
    const filePath = `file:///api/${fileName}`;
    javascriptDefaults.addExtraLib(content, filePath);
    // When resolving definitions and references, the editor will try to use created models.
    // Creating a model for the library allows "peek definition/references" commands to work with the library.
    monaco.editor.createModel(
      content,
      "typescript",
      monaco.Uri.parse(filePath)
    );
  }
}
