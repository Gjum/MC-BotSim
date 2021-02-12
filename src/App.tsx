import raw from "raw.macro";
import { useEffect, useMemo, useState } from "react";
import { UUID } from "./api/Bot";
import "./App.css";
import { SimulationEnvironment } from "./botSimulator/SimulationEnvironment";
import { World } from "./botSimulator/World";
import { useOnChange } from "./hooks";
import { ScriptEditor } from "./ScriptEditor";
import WorldView from "./worldView/WorldView";

const exampleScript = raw("./scripts/test.js");

export default function App() {
  const { simulator, setScript } = useSimulator(exampleScript);
  const followedPlayerUUID = useFollowedPlayer(simulator);

  if (!simulator) {
    return <div className="App centering">Loading simulator ...</div>;
  }

  return (
    <div className="App">
      <div className="App-editor">
        <ScriptEditor
          script={simulator.script}
          onChange={(content) => setScript(content || "")}
        />
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

export function Controls({ simulator }: { simulator: SimulationEnvironment }) {
  useOnChange(simulator);

  if (simulator.error) {
    return (
      <div
        className="Controls centering"
        style={{ padding: ".5em", color: "red" }}
      >
        Error: {String(simulator.error)}
      </div>
    );
  }

  function runClicked() {
    simulator.startTicking();
  }
  function pauseClicked() {
    simulator.stopTicking();
  }
  function resetClicked() {
    simulator.stopTicking();
    // XXX reset simulation
  }

  return (
    <div className="Controls centering" style={{ padding: ".5em" }}>
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

function useSimulator(defaultScript: string) {
  const [script, setScript] = useState(defaultScript);

  const simulator = useMemo(() => {
    const simulator = new SimulationEnvironment(script);
    setBlocksFromMap(simulator.world, exampleMapStrs);
    return simulator;
  }, [script]);

  return { simulator, setScript };
}

function useFollowedPlayer(simulator: SimulationEnvironment) {
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

  return followedPlayerUUID;
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
