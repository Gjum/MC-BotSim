import { CancelToken } from "./CancelToken";
import { Look } from "./Look";
import { Vec3 } from "./Vec3";
import { McWindow } from "./Window";

export interface Player {
  readonly name: string;
  readonly uuid: UUID;
  readonly position: Vec3;
  readonly look: Look;
}

/**
 * Tracks player state across sessions.
 * Automatically reconnects and sets up events again.
 */
export interface Bot extends Player {
  readonly gameAddress: string;
  readonly name: string;
  readonly uuid: UUID;
  autoReconnect: boolean;

  readonly connectionStatus: ConnectionStatus;
  readonly position: Vec3;
  readonly look: Look;
  readonly health: number;
  readonly food: number;
  readonly saturation: number;

  /** Monotonically increases. Adjusts to server TPS. */
  readonly gameTick: number;

  /** null while a window is being opened (no window to interact with) */
  readonly window: McWindow | null;

  /**
   * Connect to `gameAddress`.
   * To connect to a different address, create a new Bot,
   * for example through an `Environment`: `env.makeBot(address, options)`.
   * The returned `Promise` resolves once the bot joined the game.
   * */
  connect(cancelToken?: CancelToken): Promise<void>;
  disconnect(): void;
  close(): void;

  /** distance feet-eyes */
  getEyeHeight(): number;

  // the following actions execute instantly

  chat(message: string): void;

  /** Control movement similar to pressing/releasing keys on the visual client. */
  setControlState(control: Control, state: boolean): void;

  placeBlock(position: Vec3, hand?: Hand): void;

  startDigging(pos: Vec3): void;
  stopDigging(pos: Vec3): void;
  cancelDigging(pos: Vec3): void;

  startUsingItem(hand?: Hand): void;
  stopUsingItem(hand?: Hand): void;

  // the following actions take time, so they return a `Promise`

  setLook(look: Look): Promise<void>;

  swapSlotWithHotbar(slot: number, hotbar: number): Promise<void>;

  waitJoinGame(cancelToken?: CancelToken): Promise<void>;
  waitNextPhysicsSend(cancelToken?: CancelToken): Promise<void>;
}

export type UUID = string;

export type ConnectionStatus =
  | "offline"
  | "connecting"
  | "online"
  | "kicked"
  | "error";

export type Hand = "left" | "right";

export type Control = "forward" | "left" | "right" | "back";

export type ChatMsg = Object; // TODO
