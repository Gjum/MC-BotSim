import { CancelToken } from "./CancelToken";
import { Look } from "./Look";
import { Vec3 } from "./Vec3";
import { McWindow, Slot } from "./Window";

/**
 * Tracks player state across sessions.
 * Automatically reconnects and sets up events again.
 */
export interface Bot extends Entity {
  readonly gameAddress: string;
  /** Monotonically increases. Adjusts to server TPS. */
  readonly gameTick: number;
  readonly playerList: Record<UUID, PlayerListItem>;

  readonly connectionStatus: ConnectionStatus;
  autoReconnect: boolean;

  readonly name: string;
  readonly uuid: UUID;
  readonly position: Vec3;
  readonly look: Look;
  readonly health: number;
  readonly food: number;
  readonly saturation: number;
  movementSpeed: number;

  /** null while a window is being opened (no window to interact with) */
  readonly window: McWindow | null;
  hotbarSelection: number;

  /**
   * Connect to `gameAddress`.
   * To connect to a different address, create a new Bot,
   * for example through an `Environment`: `env.makeBot(address, options)`.
   * The returned `Promise` resolves once the bot joined the game.
   * */
  connect(cancelToken?: CancelToken): Promise<void>;
  disconnect(): void;
  shutdown(): void;

  /** distance feet-eyes */
  getEyeHeight(): number;

  // the following actions execute instantly

  chat(message: string): void;
  /** Control movement similar to pressing/releasing keys on the visual client. */
  setControlState(control: Control, state: boolean): void;

  selectHotbar(index: number): void;
  // swapHands(): void; // TODO
  closeWindow(): void;

  /**
   * Place a block from the `hand` slot after turning to look at `location`.
   * `location` can include sub-block resolution coordinates.
   */
  placeBlock(location: Vec3, hand?: Hand): void;
  /**
   * Activates (right-click) the block after turning to look at `location`.
   * Un-sneaks for a tiny moment if necessary.
   * `location` can include sub-block resolution coordinates.
   */
  activateBlock(location: Vec3, hand?: Hand): void;

  /** The location that the bot is currently digging. */
  readonly digLocation: Vec3 | null;
  startDigging(location: Vec3): void;
  stopDigging(location: Vec3): void;
  cancelDigging(location: Vec3): void;

  startUsingItem(hand?: Hand): void;
  stopUsingItem(hand?: Hand): void;

  /** Attack the looked-at entity. */
  attackEntity(): void;
  /** Interact (right-click) the looked-at entity. */
  interactEntity(): void;

  // the following actions take time, so they return a `Promise`

  respawn(): Promise<void>;

  setLook(look: Look): Promise<void>;

  waitJoinGame(cancelToken?: CancelToken): Promise<void>;
  /** Wait for the position/look having been sent to the server. */
  waitNextPhysicsSend(cancelToken?: CancelToken): Promise<void>;
  /** Wait for any window to be open. */
  waitWindowOpen(cancelToken?: CancelToken): Promise<McWindow>;
}

export type UUID = string;

export interface PlayerListItem {
  readonly uuid: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly ping: number;
  readonly gamemode: number;
}

export interface Entity {
  readonly uuid: UUID;
  readonly name?: string;
  readonly position: Vec3;
  readonly look: Look;
}

export type ConnectionStatus =
  | "offline"
  | "connecting"
  | "online"
  | "kicked"
  | "error";

export type Hand = "left" | "right";

export type Control =
  | "forward"
  | "left"
  | "right"
  | "back"
  | "jump"
  | "sneak"
  | "sprint";

export type ChatMsg = Object; // TODO
