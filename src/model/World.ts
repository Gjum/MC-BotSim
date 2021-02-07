import { Chunk } from "./Chunk";
import { Player, UUID } from "./Player";

export interface World {
  chunks: Record<ChunkKey, Chunk>;
  players: Record<UUID, Player>;
  followedPlayerUUID?: UUID;
}

export type ChunkKey = string;
type ChunkPosPart = { cx: number; cz: number };
export const getKeyForChunk = ({ cx, cz }: ChunkPosPart): ChunkKey =>
  `${cx},${cz}`;

export const emptyWorld: World = {
  chunks: {},
  players: {},
};
