import { Block } from "./Block";
import { getBlockColNrForXZ, getBlockNrForXYZ, Chunk } from "./Chunk";
import { Player, UUID } from "./Player";

export interface World {
  chunks: Record<ChunkKey, Chunk>;
  players: Record<UUID, Player>;
  followedPlayerUUID?: UUID;
}

export type ChunkKey = string;
type ChunkPosPart = { cx: number; cz: number };
export const getChunkKey = ({ cx, cz }: ChunkPosPart): ChunkKey =>
  `${cx},${cz}`;

export const emptyWorld: World = {
  chunks: {},
  players: {},
};

export function getBlockInWorld(
  world: World,
  x: number,
  y: number,
  z: number
): Block | null {
  const cx = x >> 4;
  const cz = z >> 4;
  const chunkKey = getChunkKey({ cx, cz });
  const chunk = world.chunks[chunkKey];
  if (!chunk) return null;
  const blockNr = getBlockNrForXYZ(x, y, z);
  return chunk.blocks[blockNr] || null;
}

export function getHeightInWorld(
  world: World,
  x: number,
  z: number
): number | null {
  const cx = x >> 4;
  const cz = z >> 4;
  const chunkKey = getChunkKey({ cx, cz });
  const chunk = world.chunks[chunkKey];
  if (!chunk) return -1;
  if (!chunk.heights) return null;
  const blockNr = getBlockColNrForXZ(x, z);
  return chunk.heights[blockNr];
}
