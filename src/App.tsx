import { useReducer } from "react";
import "./App.css";
import { makePlayer } from "./model/Player";
import { emptyWorld, World } from "./model/World";
import { reduceWorld, WorldAction, WorldOnlyAction } from "./model/WorldAction";
import WorldView from "./WorldView";

export default function App() {
  const [world, dispatchWorld] = useReducer(
    reduceWorld,
    emptyWorld,
    makeExampleWorld
  );

  return (
    <div className="App">
      <WorldView {...{ world }} />
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

const makeExampleWorld = () =>
  ([
    ...convertMapStrsToBlockUpdates(exampleMapStrs),
    { type: "chunk:compute_heights", cx: -1, cz: -1 },
    { type: "chunk:compute_heights", cx: -1, cz: 0 },
    { type: "chunk:compute_heights", cx: 0, cz: -1 },
    { type: "chunk:compute_heights", cx: 0, cz: 0 },
  ] as WorldAction[]).reduce<World>((s, a) => reduceWorld(s, a), {
    followedPlayerUUID: "42",
    players: {
      "42": { ...makePlayer("42", "Bot"), x: 0.5, z: 0.5 },
    },
    chunks: {},
  });

function convertMapStrsToBlockUpdates(mapStrs: string[]): WorldOnlyAction[] {
  const x0 = -Math.floor(mapStrs[0].split(" ").length / 2);
  const z0 = -Math.floor(mapStrs.length / 2);
  return mapStrs.flatMap((r, zi) =>
    r.split(" ").flatMap((s, xi) => {
      const height = +s[0];
      const material = materialShorthands[s[1]];
      const arr: WorldOnlyAction[] = [];
      for (let y = 0; y <= height; y++) {
        arr.push({
          type: "world:update_block",
          x: x0 + xi,
          y,
          z: z0 + zi,
          block: { material },
        });
      }
      return arr;
    })
  );
}
