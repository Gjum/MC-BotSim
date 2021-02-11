import MonacoEditor, { Monaco } from "@monaco-editor/react";
import raw from "raw.macro";

const exampleJs = {
  content: raw("./scripts/test.js"),
  path: "./scripts/test.js",
  language: "javascript",
};
const exampleTs = {
  content: raw("./scripts/test.ts"),
  path: "./scripts/test.ts",
  language: "typescript",
};

/** All files under ./bot/ to be loaded into the editor (`addExtraLib`). */
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

const file = exampleTs;

export function ScriptEditor() {
  return (
    <MonacoEditor
      height="100%"
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        renderWhitespace: "boundary",
        wordWrap: "on",
      }}
      defaultValue={file.content}
      defaultLanguage={file.language}
      defaultPath={file.path}
      loading={"Loading script editor..."}
      beforeMount={(m) => {
        addLibs(m);
      }}
      onChange={(content) => {
        // TODO console.log({ content });
      }}
    />
  );
}

function addLibs(monaco: Monaco) {
  const {
    javascriptDefaults,
    typescriptDefaults,
  } = monaco.languages.typescript;
  for (const fileName of apiFiles) {
    const content = readApiFile(fileName);
    const filePath = `../api/${fileName}`;
    javascriptDefaults.addExtraLib(content, filePath);
    typescriptDefaults.addExtraLib(content, filePath);
  }
}
