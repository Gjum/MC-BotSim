import { Bot, Player, UUID } from "../api/Bot";
import { Block } from "./Block";
import { Chunk } from "./Chunk";
import { EventSystem, EventSystemLater } from "../util";

export class World {
  private bots: Record<UUID, Bot> = {};
  private chunks: Record<ChunkKey, Chunk> = {};
  private players: Record<UUID, Player> = {};
  followedPlayerUUID?: UUID;

  private changeEvent = new EventSystemLater();
  readonly onEachChange = this.changeEvent.onEach;
  readonly onNextChange = this.changeEvent.onNext;

  private tickEvent = new EventSystem<number>();
  readonly onEachTick = this.tickEvent.onEach;
  readonly onNextTick = this.tickEvent.onNext;

  /** this includes bots */
  getPlayers() {
    return Object.values(this.players);
  }

  getBots() {
    return Object.values(this.bots);
  }

  getBotByUUID(uuid: UUID): Bot | undefined {
    return this.bots[uuid];
  }

  registerBot(bot: Bot) {
    if (this.bots[bot.uuid]) {
      throw new Error(`UUID ${bot.uuid} already exists in world`);
    }
    this.bots[bot.uuid] = bot;
    this.players[bot.uuid] = bot;
    this.changeEvent.emitLater();
  }

  unregisterBot(bot: Bot) {
    if (!this.bots[bot.uuid]) {
      console.error(`Tried removing unknown bot with UUID ${bot.uuid}`);
      return;
    }
    delete this.bots[bot.uuid];
    delete this.players[bot.uuid];
    this.changeEvent.emitLater();
  }

  notifyChildChanged(child: any) {
    this.changeEvent.emitLater();
  }

  /** null means unloaded chunk or outside the world */
  getBlock(x: number, y: number, z: number): Block | null {
    const cx = x >> 4;
    const cz = z >> 4;
    const chunkKey = getChunkKey({ cx, cz });
    const chunk = this.chunks[chunkKey];
    if (!chunk) return null;
    return chunk.getBlock(x, y, z) || null;
  }

  setBlock(x: number, y: number, z: number, block: Block) {
    const cx = x >> 4;
    const cz = z >> 4;
    const chunkKey = getChunkKey({ cx, cz });
    let chunk = this.chunks[chunkKey];
    if (!chunk) chunk = this.chunks[chunkKey] = new Chunk(cx, cz);
    this.changeEvent.emitLater();
    return chunk.setBlock(x, y, z, block);
  }

  /** null means unloaded chunk */
  getHeight(x: number, z: number): number | null {
    const cx = x >> 4;
    const cz = z >> 4;
    const chunkKey = getChunkKey({ cx, cz });
    const chunk = this.chunks[chunkKey];
    if (!chunk) return null;
    return chunk.getHeight(x, z);
  }

  private gameTick = 1;
  getGameTick() {
    return this.gameTick;
  }

  doTick() {
    // game tick increasing does not emit a change event,
    // but the tick listeners may emit a change event through `notifyChildChanged`
    ++this.gameTick;
    this.tickEvent.emit(this.gameTick);
  }
}

export type TickHandler = (tick: number) => void;

type ChunkKey = string;
type ChunkPosPart = { cx: number; cz: number };
const getChunkKey = ({ cx, cz }: ChunkPosPart): ChunkKey => `${cx},${cz}`;
