import Look from "./api/Look";
import Vec3 from "./api/Vec3";
import "./App.css";
import { BotSim } from "./botSimulator/BotSim";
import { SimulationEnvironment } from "./botSimulator/SimulationEnvironment";
import { World } from "./botSimulator/World";
import { ScriptEditor } from "./ScriptEditor";
import { useOnChange, usePromise } from "./util";
import WorldView from "./WorldView";

export default function App() {
  const { value: simulator } = usePromise(() =>
    makeExampleSimulator(exampleMapStrs)
  );

  if (!simulator)
    return (
      <div className="App" style={styleCentered}>
        Loading simulator ...
      </div>
    );

  return (
    <div className="App">
      <div className="App-editor">
        <ScriptEditor />
      </div>
      <div className="App-controls">
        <Controls simulator={simulator} />
      </div>
      <div className="App-world">
        <WorldView world={simulator.world} />
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

async function makeExampleSimulator(mapStrs: string[]) {
  const sim = new SimulationEnvironment();
  const world = sim.world;

  setBlocksFromMap(world, mapStrs);

  const bot: BotSim = await sim.makeBot("", { uuid: "42", name: "Bot" });
  world.followedPlayerUUID = bot.uuid;
  bot.position = new Vec3(0.5, 1, 0.5);
  bot.look = Look.fromDegrees(-45, 0);
  bot.setControlState("forward", true);

  world.onEachTick((tick) => console.log(`World tick`, tick));

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
