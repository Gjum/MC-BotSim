import MonacoEditor from "@monaco-editor/react";
import { useMemo } from "react";
import "./App.css";
import Vec3 from "./bot/Vec3";
import { BotSim } from "./botSimulator/BotSim";
import { World } from "./botSimulator/World";
import WorldView from "./WorldView";

export default function App() {
  const world = useMemo(() => makeExampleWorld(exampleMapStrs), []);

  return (
    <div className="App">
      <ScriptEditor />
      <div className="App-world">
        <WorldView {...{ world }} />
      </div>
    </div>
  );
}

function ScriptEditor() {
  return (
    <div className="App-editor">
      <MonacoEditor
        height="100%"
        theme="vs-dark"
        defaultLanguage="typescript"
        value={exampleScript}
        onChange={console.log}
        options={{
          minimap: { enabled: false },
          wordWrap: "on",
        }}
      />
    </div>
  );
}

const exampleScript = `
//345678901234567890123456789012345678901234567890123456789012345678901234567890
console.log("Hello world!");
export interface Test {}
async function main() {
  sdffd
}
`.trim();

const exampleMapStrs = [
  "1s 1s 3s 3s 3s",
  "2s 2s 1a 1s 1r",
  "3s 2a 1g 3a 3s",
  "3s 2s 1a 1s 1s",
  "3s 2s 1s 3r 1s",
];
const materialShorthands: Record<string, string> = {
  g: "minecraft:gold_block",
  s: "minecraft:stone",
  r: "minecraft:redstone_block",
  a: "minecraft:grass",
};

function makeExampleWorld(mapStrs: string[]) {
  const world = new World();

  setBlocksFromMap(world, mapStrs);

  const bot = new BotSim(world, { uuid: "42", name: "Bot" });
  bot.position = new Vec3(0.5, 1, 0.5);
  world.followedPlayerUUID = "42";

  setInterval(() => world.doTick(), 1000);

  return world;
}

function setBlocksFromMap(world: World, mapStrs: string[]) {
  const x0 = -Math.floor(mapStrs[0].split(" ").length / 2);
  const z0 = -Math.floor(mapStrs.length / 2);
  mapStrs.forEach((r, zi) =>
    r.split(" ").forEach((s, xi) => {
      const height = +s[0];
      const material = materialShorthands[s[1]];
      for (let y = 0; y < height; y++) {
        world.setBlock(x0 + xi, y, z0 + zi, { material });
      }
    })
  );
}
