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

const makeExampleWorld = () =>
  ([...actionsExampleBlocks] as WorldAction[]).reduce<World>(
    (s, a) => reduceWorld(s, a),
    {
      followedPlayerUUID: "42",
      players: {
        "42": { ...makePlayer("42", "Bot"), x: 0.5, z: 0.5 },
      },
      chunks: {},
    }
  );

const actionsExampleBlocks = [
  [-2, -1, "minecraft:stone"],
  [-2, 0, "minecraft:stone"],
  [-2, 1, "minecraft:stone"],
  [-1, -1, "minecraft:stone"],
  [-1, 0, "minecraft:stone"],
  [-1, 1, "minecraft:stone"],
  [0, -1, "minecraft:stone"],
  [0, 0, "minecraft:gold_block"],
  [0, 1, "minecraft:stone"],
  [1, -1, "minecraft:stone"],
  [1, 0, "minecraft:stone"],
  [1, 1, "minecraft:stone"],
  [2, -1, "minecraft:stone"],
  [2, 0, "minecraft:stone"],
  [2, 1, "minecraft:stone"],
].map(
  ([x, z, material]) =>
    ({
      type: "world:update_block",
      x,
      z,
      block: { material },
    } as WorldOnlyAction)
);
