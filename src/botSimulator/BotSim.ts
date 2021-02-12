import { Bot, ConnectionStatus, Control, Hand, UUID } from "../api/Bot";
import { CancelToken } from "../api/CancelToken";
import Look from "../api/Look";
import Vec3 from "../api/Vec3";
import { McWindow } from "../api/Window";
import { World } from "./World";
import { definedOr } from "../util";
import { EventSystem } from "../EventSystem";

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

  connectionStatus: ConnectionStatus = "offline";
  position = new Vec3(0, 0, 0);
  look = new Look(0, 0);
  health = 0;
  food = 0;
  saturation = 0;
  gameTick = 1;
  window: McWindow | null = null;

  controlState = {} as Record<Control, boolean>;
  movementSpeed = 0.1; // meters per tick

  private conectionStatusEvent = new EventSystem<ConnectionStatus>();
  readonly onEachConnectionChange = this.conectionStatusEvent.onEach;
  readonly onNextConnectionChange = this.conectionStatusEvent.onNext;

  unregisterPhysics: () => void = () => {};

  constructor(world: World, options: BotSimOptions) {
    this.world = world;
    this.name = options.name;
    this.uuid = options.uuid;
    this.autoReconnect = definedOr(options.autoReconnect, true);
  }

  private doPhysicsTick() {
    let velocity = new Vec3();
    {
      let controlVel = new Vec3();
      if (this.controlState.forward) {
        const forwardVelocity = this.look.toVec3();
        controlVel = controlVel.plus(forwardVelocity);
      }
      velocity = velocity.plus(controlVel.scaled(this.movementSpeed));
    }
    // XXX do other physics: falling, collision
    this.position = this.position.plus(velocity);
    this.world.notifyChildChanged(this);
  }

  async connect(cancelToken?: CancelToken) {
    if (this.connectionStatus === "online") return;
    if (this.connectionStatus === "connecting") return;
    this.connectionStatus = "connecting";
    this.conectionStatusEvent.emit(this.connectionStatus);
    // in this simulation we connect really quickly, and never fail
    setImmediate(() => {
      // update simulation
      console.log(`bot: simulate connected`);
      this.world.registerBot(this);
      this.handleConnected();
    });

    return await this.waitJoinGame(cancelToken);
  }

  private handleConnected() {
    this.connectionStatus = "online";

    this.unregisterPhysics = this.world.onEachTick((tick) =>
      this.doPhysicsTick()
    );

    this.conectionStatusEvent.emit(this.connectionStatus);
  }

  disconnect() {
    this.connectionStatus = "offline";

    this.unregisterPhysics();

    this.conectionStatusEvent.emit(this.connectionStatus);

    // update simulation
    this.world.unregisterBot(this);
  }

  close() {
    this.disconnect();
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

  chat(message: string): void {
    console.log(`Chat:`, message); // TODO show in webpage
  }

  async setLook(look: Look): Promise<void> {
    this.look = look;
    return await this.waitNextPhysicsSend();
  }

  async swapSlotWithHotbar(slot: number, hotbar: number): Promise<void> {
    throw new Error("Method not implemented."); // TODO
  }

  async waitJoinGame(cancelToken?: CancelToken): Promise<void> {
    if (this.connectionStatus === "online") return;
    this.connect();
    let rmCancel: undefined | (() => void) = undefined;
    let rmEvent: undefined | (() => void) = undefined;
    try {
      return await new Promise<void>((resolve, reject) => {
        if (cancelToken) rmCancel = cancelToken.onCancel(reject);
        rmEvent = this.onEachConnectionChange((status) => {
          if (status === "online") resolve();
          else if (status === "offline") this.connect();
          else if (status !== "connecting")
            reject(new Error(`Connection failed: ${status}`));
        });
      });
    } finally {
      if (rmCancel) rmCancel!();
      if (rmEvent) rmEvent!();
    }
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
