import { Bot, Entity, UUID } from "../api/Bot";
import { Block } from "./Block";
import { Chunk } from "./Chunk";
import { EventSystem, EventSystemLater } from "../EventSystem";
import Vec3 from "../api/Vec3";
import Look from "../api/Look";
import { McWindow } from "../api/Window";
import { PlayerInventory } from "./WindowSim";

export class World {
  private bots: Record<UUID, Bot> = {};
  private chunks: Record<ChunkKey, Chunk> = {};
  private entities: Record<UUID, Entity> = {};

  private changeEvent = new EventSystemLater();
  readonly onEachChange = this.changeEvent.onEach;
  readonly onNextChange = this.changeEvent.onNext;

  private tickEvent = new EventSystem<number>();
  readonly onEachTick = this.tickEvent.onEach;
  readonly onNextTick = this.tickEvent.onNext;

  private playerJoinedEvent = new EventSystem<Entity>();
  readonly onEachPlayerJoined = this.playerJoinedEvent.onEach;
  readonly onNextPlayerJoined = this.playerJoinedEvent.onNext;

  getEntities() {
    return Object.values(this.entities);
  }

  getBots() {
    return Object.values(this.bots);
  }

  getBotByUUID(uuid: UUID): Bot | undefined {
    return this.bots[uuid];
  }

  spawnPlayer(player: MutablePlayer) {
    player.position = new Vec3(0.5, 1.5, 0.5);
    player.look = new Look(0, 0);
    player.health = 10;
    player.food = 10;
    player.saturation = 5;
    player.window = new PlayerInventory(player);
  }

  registerBot(bot: Bot) {
    if (this.bots[bot.uuid]) {
      throw new Error(`UUID ${bot.uuid} already exists in world`);
    }
    this.bots[bot.uuid] = bot;
    this.entities[bot.uuid] = bot;
    this.playerJoinedEvent.emit(bot);
    this.changeEvent.emitLater();
  }

  unregisterBot(bot: Bot) {
    if (!this.bots[bot.uuid]) {
      console.error(`Tried removing unknown bot with UUID ${bot.uuid}`);
      return;
    }
    delete this.bots[bot.uuid];
    delete this.entities[bot.uuid];
    this.changeEvent.emitLater();
  }

  /**
   * Entities, chunks, etc. should call this
   * so listeners know that some part of the world changed.
   */
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

export interface MutablePlayer extends Entity {
  position: Vec3;
  look: Look;
  health: number;
  food: number;
  saturation: number;
  hotbarSelection: number;
  window: McWindow | null;
}

export type TickHandler = (tick: number) => void;

type ChunkKey = string;
type ChunkPosPart = { cx: number; cz: number };
const getChunkKey = ({ cx, cz }: ChunkPosPart): ChunkKey => `${cx},${cz}`;
