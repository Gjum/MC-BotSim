import { Block } from "./Block";
import { Chunk, computeHeights, updateBlockInChunk } from "./Chunk";

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
      y: number;
      z: number;
      block: Block;
    }
  | {
      type: "chunk:compute_heights";
    }
);

export function reduceChunk(chunk: Chunk, action: ChunkAction): Chunk {
  if (chunk.cx !== action.cx) return chunk;
  if (chunk.cz !== action.cz) return chunk;
  switch (action.type) {
    case "chunk:update":
      return { ...chunk, ...action.chunk };
    case "chunk:update_block": {
      const { x, y, z, block } = action;
      return updateBlockInChunk(chunk, x, y, z, block);
    }
    case "chunk:compute_heights": {
      return { ...chunk, heights: computeHeights(chunk) };
    }
    default:
      return chunk;
  }
}
