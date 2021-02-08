import EventEmitter from "events";
import { Bot, Control, Hand, UUID } from "../bot/Bot";
import { CancelToken } from "../bot/CancelToken";
import Look from "../bot/Look";
import Vec3 from "../bot/Vec3";
import { McWindow } from "../bot/Window";
import { World } from "./World";
import { definedOr } from "../util";

export type BotSimOptions = {
  name: string;
  uuid: UUID;
  autoReconnect?: boolean;
};

export class BotSim implements Bot {
  world: World;
  gameAddress = "Simulator";
  name: string;
  uuid: UUID;
  autoReconnect: boolean;

  position = new Vec3(0, 0, 0);
  look = new Look(0, 0);
  health = 0;
  food = 0;
  saturation = 0;
  gameTick = 1;
  window: McWindow | null = null;

  controlState = {} as Record<Control, boolean>;
  events = new EventEmitter();

  unregisterPhysics: () => void;

  constructor(world: World, options: BotSimOptions) {
    this.world = world;
    this.name = options.name;
    this.uuid = options.uuid;
    this.autoReconnect = definedOr(options.autoReconnect, true);

    world.registerBot(this);

    this.unregisterPhysics = world.onEachTick((tick) => {
      // XXX do physics
    });
  }

  close() {
    this.unregisterPhysics();
    this.world.unregisterBot(this);
  }

  getEyeHeight() {
    return 1.68; // TODO this can change when sneaking, also not sure if correct value
  }

  setControlState(control: Control, state: boolean): void {
    this.controlState[control] = state;
    // TODO send un/sneak, un/sprint, etc.
  }

  placeBlock(position: Vec3, hand?: Hand) {
    throw new Error("Method not implemented."); // TODO
  }

  startDigging(position: Vec3): void {
    throw new Error("Method not implemented."); // TODO
  }

  stopDigging(position: Vec3): void {
    throw new Error("Method not implemented."); // TODO
  }

  cancelDigging(position: Vec3): void {
    throw new Error("Method not implemented."); // TODO
  }

  startUsingItem(hand?: Hand): void {
    throw new Error("Method not implemented."); // TODO
  }

  stopUsingItem(hand?: Hand): void {
    throw new Error("Method not implemented."); // TODO
  }

  async lookAt(position: Vec3): Promise<void> {
    const delta = position.minus(
      this.position.plus(new Vec3(0, this.getEyeHeight(), 0))
    );
    const yaw = Math.atan2(-delta.x, -delta.z);
    const groundDistance = Math.sqrt(delta.x * delta.x + delta.z * delta.z);
    const pitch = Math.atan2(delta.y, groundDistance);
    return await this.lookRadians(yaw, pitch);
  }

  async lookHorizontal(position: Vec3): Promise<void> {
    const delta = this.position.minus(position); // no need to adjust y
    const yaw = Math.atan2(delta.x, delta.z);
    return await this.lookRadians(yaw, 0);
  }

  async lookDegrees(yaw: number, pitch: number): Promise<void> {
    yaw = 180 - yaw;
    pitch = -pitch;
    return await this.lookRadians(
      (yaw * Math.PI) / 180,
      (pitch * Math.PI) / 180
    );
  }

  async lookRadians(yaw: number, pitch: number): Promise<void> {
    this.look = new Look(yaw, pitch);
    return await this.waitNextPhysicsSend();
  }

  async swapSlotWithHotbar(slot: number, hotbar: number): Promise<void> {
    throw new Error("Method not implemented."); // TODO
  }

  async waitJoinGame(cancelToken?: CancelToken): Promise<void> {
    throw new Error("Method not implemented."); // TODO
  }

  async waitNextPhysicsSend(cancelToken?: CancelToken): Promise<void> {
    await this.waitJoinGame(cancelToken);
    return await new Promise<void>((resolve) => {
      this.world.onNextTick((tick) => {
        resolve();
      });
    });
  }
}
