import { addHelpersToBot, BotWithHelpers } from "../api/botHelpers";
import { BotOptions, Environment } from "../api/Environment";
import Vec3 from "../api/Vec3";
import { BotSim } from "./BotSim";
import { EventSystem } from "../EventSystem";
import { World } from "./World";

type SimulationState = "stopped" | "running";

export class SimulationEnvironment implements Environment {
  world = new World();

  readonly tps = 20;

  private tickTimer?: NodeJS.Timeout;

  get state(): SimulationState {
    return this.tickTimer ? "running" : "stopped";
  }

  private changeEvent = new EventSystem<void>();
  readonly onEachChange = this.changeEvent.onEach;

  async makeBot(
    gameAddress: string,
    options: BotOptions
  ): Promise<BotSim & BotWithHelpers> {
    // TODO when offline mode, get UUID for name
    const optionsSim = { name: "Bot", uuid: "42", ...options };
    const bot = new BotSim(this.world, optionsSim);
    bot.position = new Vec3(0.5, 1, 0.5);

    this.world.followedPlayerUUID = bot.uuid;

    const botWithHelpers = addHelpersToBot(bot);
    return botWithHelpers;
  }

  startTicking(tps = this.tps) {
    if (this.tickTimer && tps === this.tps) return; // already ticking
    this.stopTicking();
    this.tickTimer = setInterval(() => this.world.doTick(), this.tps);
    this.changeEvent.emit();
  }

  stopTicking() {
    if (!this.tickTimer) return; // already stopped
    clearInterval(this.tickTimer);
    this.tickTimer = undefined;
    this.changeEvent.emit();
  }

  // useful exports for usage in scripts
  Vec3 = Vec3;
}
