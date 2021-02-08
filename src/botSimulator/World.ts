import { Block } from "./Block";
import { Bot, Player, UUID } from "../bot/Bot";
import { Chunk } from "./Chunk";
import { doEventHandler, emitEventTo, RunLater } from "../util";

export class World {
  private bots: Record<UUID, Bot> = {};
  private chunks: Record<ChunkKey, Chunk> = {};
  private players: Record<UUID, Player> = {};
  followedPlayerUUID?: UUID;

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
    this.changeEmitter.runLater();
  }

  unregisterBot(bot: Bot) {
    if (!this.bots[bot.uuid]) {
      console.error(`Tried removing unknown bot with UUID ${bot.uuid}`);
      return;
    }
    delete this.bots[bot.uuid];
    delete this.players[bot.uuid];
    this.changeEmitter.runLater();
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
    this.changeEmitter.runLater();
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
    // game tick increasing does not emit a change event
    ++this.gameTick;

    // run "each" handlers first, to do "background" work
    // run "next" handlers last, to handle "background" changes
    emitEventTo(this.gameTick, this.tickEachHandlers, this.tickNextHandlers);
  }

  // TODO restructure events api: changeEvent.{onNext,onEach,_emit}

  private nextHandlerId = 1;

  private changeHandlers: Record<number, () => void> = {};
  private changeEmitter = new RunLater(() =>
    emitEventTo(this, this.changeHandlers)
  );
  onChange(handler: () => void) {
    return doEventHandler(this.changeHandlers, ++this.nextHandlerId, handler);
  }

  private tickEachHandlers: Record<number, TickHandler> = {};
  onEachTick(handler: TickHandler) {
    return doEventHandler(this.tickEachHandlers, ++this.nextHandlerId, handler);
  }

  private tickNextHandlers: Record<number, TickHandler> = {};
  onNextTick(handler: TickHandler) {
    return doEventHandler(this.tickNextHandlers, ++this.nextHandlerId, handler);
  }
}

export type TickHandler = (tick: number) => void;

type ChunkKey = string;
type ChunkPosPart = { cx: number; cz: number };
const getChunkKey = ({ cx, cz }: ChunkPosPart): ChunkKey => `${cx},${cz}`;
