import { Bot, ConnectionStatus, Control, Hand, UUID } from "../api/Bot";
import { CancelToken } from "../api/CancelToken";
import Look from "../api/Look";
import Vec3 from "../api/Vec3";
import { McWindow } from "../api/Window";
import { World } from "./World";
import { definedOr } from "../util";
import { EventSystem } from "../EventSystem";
import { MATERIAL_AIR } from "./Block";
import {
  GRAVITY,
  DRAG,
  PLAYER_APOTHEM,
  PLAYER_HEIGHT_STANDING,
  WALK_SPEED,
} from "../api/constants";

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
  position = new Vec3();
  velocity = new Vec3();
  look = new Look(0, 0);
  health = 0;
  food = 0;
  saturation = 0;
  gameTick = 1;
  window: McWindow | null = null;

  controlState = {} as Record<Control, boolean>;
  movementSpeed = WALK_SPEED; // meters per tick

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
    this.velocity = this.velocity.minus(0, GRAVITY, 0).scaled(DRAG);

    const controlVec = this.applyControls();

    let { newPos, collidedVertically } = moveAndApplyCollision(
      this.world,
      this.position,
      this.velocity.plus(controlVec)
    );
    if (collidedVertically) {
      this.velocity = this.velocity.withY(0);
    }

    this.position = newPos;
    this.world.notifyChildChanged(this);
  }

  private applyControls() {
    let controlVec = new Vec3();
    if (this.controlState.forward) {
      const forwardVelocity = this.look.toVec3();
      controlVec = controlVec.plus(forwardVelocity);
    }
    // TODO apply other movement controls
    // TODO apply jump control
    return controlVec.scaled(this.movementSpeed);
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

/**
 * Zeroes out all axis-aligned movements that create a new collision.
 * Does not modify the passed arguments.
 * Blocks that are intersecting the player before the movement
 * are ignored in collision checks.
 */
function moveAndApplyCollision(world: World, position: Vec3, delta: Vec3) {
  const initialColl = Array.from(iterCollisions(world, position, []));
  let newPos = position;
  let testPos;
  let collidedHorizontally = false;
  let collidedVertically = false;
  testPos = newPos.plus(delta.x, 0, 0);
  if (iterCollisions(world, testPos, initialColl).next().done) {
    newPos = testPos;
  } else collidedHorizontally = true;
  testPos = newPos.plus(0, 0, delta.z);
  if (iterCollisions(world, testPos, initialColl).next().done) {
    newPos = testPos;
  } else collidedHorizontally = true;
  testPos = newPos.plus(0, delta.y, 0);
  if (iterCollisions(world, testPos, initialColl).next().done) {
    newPos = testPos;
  } else collidedVertically = true;
  return { newPos, collidedHorizontally, collidedVertically };
}

/** assumes all blocks are 1x1x1m */
function* iterCollisions(
  world: World,
  pos: Vec3,
  ignored: Vec3[]
): Generator<Vec3> {
  ignored = [...ignored]; // internal copy that we can append to
  for (const z of [-PLAYER_APOTHEM, PLAYER_APOTHEM]) {
    for (const x of [-PLAYER_APOTHEM, PLAYER_APOTHEM]) {
      for (const y of [0, 1, PLAYER_HEIGHT_STANDING]) {
        const corner = pos.plus(x, y, z);
        const blockPos = corner.floored();
        const block = world.getBlock(blockPos.x, blockPos.y, blockPos.z);
        if (block === null) continue;
        if (block.material === MATERIAL_AIR) continue;

        let skip = false;
        for (const ig of ignored) {
          if (blockPos.distanceSquared(ig) < 0.01) {
            skip = true;
            break;
          }
        }
        if (skip) continue;

        yield blockPos;
        // two corners may lie within the same block,
        // but we only want to yield the block once
        ignored.push(blockPos);
      }
    }
  }
}
