import { Block, emptyBlock, MATERIAL_AIR } from "./Block";

export interface Chunk {
  /** chunk coords. compute: `worldCoords >> 4` */
  cx: number;
  /** chunk coords. compute: `worldCoords >> 4` */
  cz: number;
  /** indexed `x + z*16 + y*256` */
  blocks: Block[];
  /** y of highest non-air block. indexed `x + z*16` */
  heights: null | number[];
}

export const CHUNK_HEIGHT = 16;

export function makeEmptyChunk(cx: number, cz: number): Chunk {
  return {
    cx,
    cz,
    blocks: Array<Block>(256 * CHUNK_HEIGHT).fill(emptyBlock),
    heights: null,
  };
}

export function getBlockNrForXYZ(x: number, y: number, z: number) {
  return (x & 0xf) + (z & 0xf) * 16 + y * 256;
}

export function getBlockColNrForXZ(x: number, z: number) {
  return (x & 0xf) + (z & 0xf) * 16;
}

export function computeHeights(chunk: Chunk): number[] {
  const heights = Array<number>(256).fill(0);
  for (let i = 0; i < 256; ++i) {
    for (let y = CHUNK_HEIGHT - 1; y >= 0; --y) {
      const block = chunk.blocks[i + 256 * y];
      if (block.material !== MATERIAL_AIR) {
        heights[i] = y;
        break; // next column
      }
    }
  }
  return heights;
}

export function updateBlockInChunk(
  chunk: Chunk,
  x: number,
  y: number,
  z: number,
  block: Block
): Chunk {
  const blocks = [...chunk.blocks];
  const blockNr = getBlockNrForXYZ(x, y, z);
  blocks[blockNr] = block;
  let heights = chunk.heights;
  // check whether heights need to be recomputed after this change
  // TODO only set this col to null
  if (heights) {
    const height = heights[getBlockColNrForXZ(x, z)];
    const isAir = block.material === MATERIAL_AIR;
    if (height > y && !isAir) {
      heights = null;
    } else if (height === y && isAir) {
      heights = null;
    }
  }
  return { ...chunk, blocks, heights };
}
