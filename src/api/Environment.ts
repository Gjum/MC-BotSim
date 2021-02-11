import { UUID } from "./Bot";
import { BotWithHelpers } from "./botHelpers";
import { Vec3 } from "./Vec3";

export type MCCredentials =
  | { name: string; uuid?: UUID } // offline mode
  | { login: string; password: string }; // authenticated

export type BotOptions = MCCredentials & {
  version?: string;
  autoReconnect?: boolean;
};

/**
 * An environment that can create bots.
 * May be a simulator, a Mineflayer bot, or something else.
 */
export interface Environment {
  makeBot(gameAddress: string, options: BotOptions): Promise<BotWithHelpers>;

  // useful imports
  Vec3: typeof Vec3;
}
