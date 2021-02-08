import { Bot, ChatMsg } from "./Bot";
import { CancelToken } from "./CancelToken";
import { Vec3 } from "./Vec3";

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

export const allHelpers = {
  digBlock,
  sleepTicks,
};

export interface BotWithHelpers extends Bot {
  digBlock: typeof digBlock;
  sleepTicks: typeof sleepTicks;
}

export function addHelpersToBot(bot: Bot): BotWithHelpers {
  const helpers: any = {};
  for (const [name, helper] of Object.entries(allHelpers)) {
    //@ts-ignore
    helpers[name] = (...args) => helper(bot, ...args);
  }
  return Object.assign(bot, helpers);
}
