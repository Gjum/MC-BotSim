import { Bot, ChatMsg } from "./Bot";
import { CancelToken } from "./CancelToken";
import { Vec3 } from "./Vec3";
import { McWindow } from "./Window";

export async function sleepTicks(
  bot: Bot,
  ticks: number,
  cancelToken?: CancelToken
) {
  const startTick = bot.gameTick;
  while (bot.gameTick - startTick < ticks) {
    if (cancelToken) cancelToken.check();
    await bot.waitNextPhysicsSend(cancelToken);
  }
  return bot.gameTick - startTick;
}

export async function digBlock(
  bot: Bot,
  position: Vec3,
  ticks: number,
  cancelToken?: CancelToken
): Promise<void> {
  await bot.lookAt(position.plus(new Vec3(0.5, 0.5, 0.5)));
  bot.startDigging(position);
  try {
    await sleepTicks(bot, ticks, cancelToken);
  } finally {
    bot.stopDigging(position);
  }
}

/** Open a container window at block `position` and use it while it is open. */
export async function withContainerOpen<T>(
  bot: Bot,
  position: Vec3,
  fn: (container: McWindow, cancelToken: CancelToken) => Promise<T>
): Promise<T> {
  throw new Error("Method not implemented.");
}

async function waitForChat(
  filter?: (text: string, chat: ChatMsg) => boolean
): Promise<{ text: string; chat: ChatMsg }> {
  throw new Error("Method not implemented.");
}

export const allHelpers = {
  digBlock,
  sleepTicks,
  waitForChat,
  withContainerOpen,
};

export interface BotWithHelpers extends Bot {
  digBlock: typeof digBlock;
  sleepTicks: typeof sleepTicks;
  waitForChat: typeof waitForChat;
  withContainerOpen: typeof withContainerOpen;
}

export function addHelpersToBot(bot: Bot): BotWithHelpers {
  const helpers: any = {};
  for (const [name, helper] of Object.entries(allHelpers)) {
    //@ts-ignore
    helpers[name] = (...args) => helper(bot, ...args);
  }
  return Object.assign(bot, helpers);
}
