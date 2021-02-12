import { Bot, ChatMsg } from "./Bot";
import { CancelToken } from "./CancelToken";
import Look from "./Look";
import { Vec3 } from "./Vec3";
import { McWindow } from "./Window";

export async function digBlock(
  this: Bot,
  position: Vec3,
  ticks: number,
  cancelToken?: CancelToken
): Promise<void> {
  await lookAt.call(this, position.plus(new Vec3(0.5, 0.5, 0.5)));
  this.startDigging(position);
  try {
    await sleepTicks.call(this, ticks, cancelToken);
  } finally {
    this.stopDigging(position);
  }
}

export async function lookAt(this: Bot, position: Vec3): Promise<void> {
  const delta = position
    .minus(this.position)
    .plus(new Vec3(0, this.getEyeHeight(), 0));
  return await this.setLook(Look.fromVec(delta));
}

export async function lookHorizontal(this: Bot, position: Vec3): Promise<void> {
  const delta = position.minus(this.position); // no need to adjust y
  const yaw = Look.fromVec(delta).yaw;
  return await lookRadians.call(this, yaw, 0);
}

export async function lookDegrees(
  this: Bot,
  yaw: number,
  pitch: number
): Promise<void> {
  return await this.setLook(Look.fromDegrees(yaw, pitch));
}

export async function lookRadians(
  this: Bot,
  yaw: number,
  pitch: number
): Promise<void> {
  return await this.setLook(new Look(yaw, pitch));
}

export async function sleepTicks(
  this: Bot,
  ticks: number,
  cancelToken?: CancelToken
) {
  const startTick = this.gameTick;
  while (this.gameTick - startTick < ticks) {
    if (cancelToken) cancelToken.check();
    await this.waitNextPhysicsSend(cancelToken);
  }
  return this.gameTick - startTick;
}

export async function waitForChat(
  filter?: (text: string, chat: ChatMsg) => boolean
): Promise<{ text: string; chat: ChatMsg }> {
  throw new Error("Method not implemented.");
}

/** Open a container window at block `position` and use it while it is open. */
export async function withContainerOpen<T>(
  this: Bot,
  position: Vec3,
  fn: (container: McWindow, cancelToken: CancelToken) => Promise<T>
): Promise<T> {
  throw new Error("Method not implemented.");
}

export const allHelpers = {
  digBlock,
  lookAt,
  lookDegrees,
  lookHorizontal,
  lookRadians,
  sleepTicks,
  waitForChat,
  withContainerOpen,
};

export interface BotWithHelpers extends Bot {
  lookAt: typeof lookAt;
  lookDegrees: typeof lookDegrees;
  lookHorizontal: typeof lookHorizontal;
  lookRadians: typeof lookRadians;
  digBlock: typeof digBlock;
  sleepTicks: typeof sleepTicks;
  waitForChat: typeof waitForChat;
  withContainerOpen: typeof withContainerOpen;
}

export function addHelpersToBot<T extends Bot>(bot: T): BotWithHelpers & T {
  for (const [name, helper] of Object.entries(allHelpers)) {
    //@ts-ignore
    bot[name] = helper;
  }
  //@ts-ignore
  return bot;
}
