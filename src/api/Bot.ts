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

  /** Connect to `gameAddress`. To connect to a different address, create a new Bot. */
  connect(cancelToken?: CancelToken): Promise<void>;
  disconnect(): void;
  close(): void;

  /** distance feet-eyes */
  getEyeHeight(): number;

  /** Control movement similar to pressing/releasing keys on the visual client. */
  setControlState(control: Control, state: boolean): void;

  placeBlock(position: Vec3, hand?: Hand): void;

  startDigging(pos: Vec3): void;
  stopDigging(pos: Vec3): void;
  cancelDigging(pos: Vec3): void;

  startUsingItem(hand?: Hand): void;
  stopUsingItem(hand?: Hand): void;

  lookAt(position: Vec3): Promise<void>;
  lookHorizontal(position: Vec3): Promise<void>;
  lookDegrees(yaw: number, pitch: number): Promise<void>;
  lookRadians(yaw: number, pitch: number): Promise<void>;

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
