import { Block, emptyBlock } from "./Block";

export interface Chunk {
  /** chunk coords. compute: `worldCoords >> 4` */
  cx: number;
  /** chunk coords. compute: `worldCoords >> 4` */
  cz: number;
  /** indexed `cx+cz*16` */
  blocks: Block[];
}

export const makeEmptyChunk = (cx: number, cz: number) => ({
  cx,
  cz,
  blocks: Array<Block>(256).fill(emptyBlock),
});
