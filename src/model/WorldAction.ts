import { reduceRecordOrCreate } from "./Actions";
import { Block } from "./Block";
import { makeEmptyChunk } from "./Chunk";
import { ChunkAction, reduceChunk } from "./ChunkAction";
import { makePlayer } from "./Player";
import { PlayerAction, reducePlayer } from "./PlayerAction";
import { getChunkKey, World } from "./World";

export type WorldAction = WorldOnlyAction | PlayerAction | ChunkAction;

export type WorldOnlyAction = {
  type: "world:update_block";
  x: number;
  y: number;
  z: number;
  block: Block;
};

export function reduceWorld(world: World, action: WorldAction): World {
  if (action.type.startsWith("player:")) {
    action = action as PlayerAction;
    const { uuid } = action;
    return {
      ...world,
      players: reduceRecordOrCreate(
        world.players,
        action.uuid,
        action,
        reducePlayer,
        () => makePlayer(uuid, "ERROR")
      ),
    };
  }
  if (action.type.startsWith("chunk:")) {
    action = action as ChunkAction;
    const { cx, cz } = action;
    return {
      ...world,
      chunks: reduceRecordOrCreate(
        world.chunks,
        getChunkKey(action),
        action,
        reduceChunk,
        () => makeEmptyChunk(cx, cz)
      ),
    };
  }
  switch (action.type) {
    case "world:update_block": {
      return reduceWorld(world, {
        type: "chunk:update_block",
        cx: action.x >> 4,
        cz: action.z >> 4,
        x: action.x,
        y: action.y,
        z: action.z,
        block: action.block,
      });
    }
    default:
      return world;
  }
}
