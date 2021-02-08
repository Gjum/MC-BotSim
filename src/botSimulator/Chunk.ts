import { Block, emptyBlock, MATERIAL_AIR } from "./Block";

export class Chunk {
  /** chunk coords. compute: `worldCoords >> 4` */
  readonly cx: number;
  /** chunk coords. compute: `worldCoords >> 4` */
  readonly cz: number;

  /** indexed `x + z*16 + y*256` */
  private blocks: Block[] = Array<Block>(256 * CHUNK_HEIGHT).fill(emptyBlock);
  /** y of highest non-air block. indexed `x + z*16` */
  private heights: null | number[] = null;

  constructor(cx: number, cz: number) {
    this.cx = cx;
    this.cz = cz;
  }

  /** Returns null if outside range (below bedrock, above sky). */
  getBlock(x: number, y: number, z: number): Block | null {
    if (y < 0 || y >= CHUNK_HEIGHT) return null;
    return this.blocks[getBlockNrForXYZ(x, y, z)];
  }

  setBlock(x: number, y: number, z: number, block: Block) {
    this.blocks[getBlockNrForXYZ(x, y, z)] = block;
    // check whether heights need to be recomputed after this change
    // TODO only set this col to null
    if (this.heights) {
      const height = this.heights[getBlockColNrForXZ(x, z)];
      const isAir = block.material === MATERIAL_AIR;
      if (height > y && !isAir) {
        this.heights = null;
      } else if (height === y && isAir) {
        this.heights = null;
      }
    }
  }

  getHeight(x: number, z: number): number {
    if (!this.heights) this.computeHeights();
    return this.heights![getBlockColNrForXZ(x, z)];
  }

  computeHeights() {
    const heights = Array<number>(256).fill(0);
    const blocks = this.blocks;
    for (let i = 0; i < 256; ++i) {
      for (let y = CHUNK_HEIGHT - 1; y >= 0; --y) {
        // HACK: shorthand for quick execution
        // we assume y-x-z order in blocks array
        const block = blocks[y + i * CHUNK_HEIGHT];
        if (block.material !== MATERIAL_AIR) {
          heights[i] = y;
          break; // next column
        }
      }
    }
    this.heights = heights;
    return heights;
  }
}

export const CHUNK_HEIGHT = 16;

function getBlockNrForXYZ(x: number, y: number, z: number) {
  // optimize for y iteration
  return y + CHUNK_HEIGHT * ((x & 0xf) + (z & 0xf) * 16);
}

function getBlockColNrForXZ(x: number, z: number) {
  return (x & 0xf) + (z & 0xf) * 16;
}
