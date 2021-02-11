import raw from "raw.macro";
import { useEffect, useState } from "react";
import { UUID } from "./api/Bot";
import "./App.css";
import { SimulationEnvironment } from "./botSimulator/SimulationEnvironment";
import { World } from "./botSimulator/World";
import { useOnChange, usePromise } from "./hooks";
import { EditorFile, ScriptEditor } from "./ScriptEditor";
import runInCircles from "./scripts/runInCircles";
import WorldView from "./WorldView";

export default function App() {
  const { value: simulator } = usePromise(() => makeExampleSimulator());

  const [followedPlayerUUID, followPlayer] = useState<UUID>();
  useEffect(() => {
    if (simulator) {
      // may already have a player connected; select it
      const somePlayer = simulator.world.getPlayers()[0];
      if (somePlayer) followPlayer(somePlayer.uuid);

      return simulator.world.onEachPlayerJoined((player) => {
        followPlayer(player.uuid);
      });
    }
  }, [simulator, followPlayer]);

  if (!simulator) {
    return (
      <div className="App" style={styleCentered}>
        Loading simulator ...
      </div>
    );
  }

  return (
    <div className="App">
      <div className="App-editor">
        <ScriptEditor file={exampleRunInCircles} />
      </div>
      <div className="App-controls">
        <Controls simulator={simulator} />
      </div>
      <div className="App-world">
        <WorldView
          world={simulator.world}
          followedPlayerUUID={followedPlayerUUID}
        />
      </div>
    </div>
  );
}

const styleCentered = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export function Controls({ simulator }: { simulator: SimulationEnvironment }) {
  useOnChange(simulator);

  function runClicked() {
    simulator.startTicking();
  }
  function pauseClicked() {
    simulator.stopTicking();
  }
  function resetClicked() {
    simulator.stopTicking();
  }

  return (
    <div style={{ ...styleCentered, margin: ".5em" }}>
      <button onClick={runClicked} disabled={simulator.state === "running"}>
        Start
      </button>
      <button onClick={pauseClicked} disabled={simulator.state === "stopped"}>
        Pause
      </button>
      <button onClick={resetClicked}>Reset</button>
    </div>
  );
}

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

async function makeExampleSimulator() {
  const sim = new SimulationEnvironment();
  setBlocksFromMap(sim.world, exampleMapStrs);
  runInCircles(sim);
  return sim;
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

const exampleJs: EditorFile = {
  content: raw("./scripts/test.js"),
  path: "./scripts/test.js",
  language: "javascript",
};
const exampleTs: EditorFile = {
  content: raw("./scripts/test.ts"),
  path: "./scripts/test.ts",
  language: "typescript",
};
const exampleRunInCircles: EditorFile = {
  content: raw("./scripts/runInCircles.ts"),
  path: "./scripts/runInCircles.ts",
  language: "typescript",
};
