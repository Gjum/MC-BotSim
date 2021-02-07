import { Block } from "./Block";
import { Chunk } from "./Chunk";

export type ChunkAction = {
  cx: number;
  cz: number;
} & (
  | {
      type: "chunk:update";
      chunk: Chunk;
    }
  | {
      type: "chunk:update_block";
      x: number;
      z: number;
      block: Block;
    }
);

export function reduceChunk(chunk: Chunk, action: ChunkAction): Chunk {
  if (chunk.cx !== action.cx) return chunk;
  if (chunk.cz !== action.cz) return chunk;
  switch (action.type) {
    case "chunk:update":
      return { ...chunk, ...action.chunk };
    case "chunk:update_block": {
      const blocks = [...chunk.blocks];
      const blockNr = (action.x & 0xf) + (action.z & 0xf) * 16;
      blocks[blockNr] = action.block;
      return { ...chunk, blocks };
    }
    default:
      return chunk;
  }
}
