import { addHelpersToBot, BotWithHelpers } from "../api/botHelpers";
import { BotOptions, Environment } from "../api/Environment";
import Vec3 from "../api/Vec3";
import { BotSim } from "./BotSim";
import { EventSystem } from "../EventSystem";
import { World } from "./World";
import CancelToken from "../api/CancelToken";

type SimulationState = "stopped" | "running";

export class SimulationEnvironment implements Environment {
  script: string;
  cancelToken?: CancelToken;
  error?: Error;

  world = new World();

  private tps = 20;

  private tickTimer?: NodeJS.Timeout;

  get state(): SimulationState {
    return this.tickTimer ? "running" : "stopped";
  }

  private changeEvent = new EventSystem<void>();
  readonly onEachChange = this.changeEvent.onEach;

  constructor(script: string) {
    this.script = script;
    this.reset();
  }

  /** Restart the simulation. */
  async reset() {
    if (this.cancelToken) {
      await this.cancelToken.cancel(new Error("Stopping simulation"));
    }
    for (const bot of this.world.getBots()) {
      this.world.unregisterBot(bot);
    }
    this.startNewScriptInstance();
  }

  /**
   * Scripts are expected to look like this:
   * ```js
   * module.exports = async (env, cancelToken) => {
   *   // ... do stuff with `env`
   * }
   * ```
   */
  startNewScriptInstance() {
    try {
      this.cancelToken = new CancelToken();
      /** this gets passed into the script */
      const scriptModule = { exports: undefined as any };
      // execute the script. doesn't start the contained function though
      Function("module", this.script)(scriptModule);
      // execute the function contained in the script
      const result = scriptModule.exports(this, this.cancelToken);
      // handle async errors
      if (result.catch) {
        result.catch((err: any) => {
          this.handleScriptError(err);
        });
      }
    } catch (err) {
      this.handleScriptError(err);
    }
  }

  private handleScriptError(error: Error) {
    this.error = error;
    this.changeEvent.emit();
  }

  async makeBot(
    gameAddress: string,
    options: BotOptions
  ): Promise<BotSim & BotWithHelpers> {
    // TODO when offline mode, get UUID for name
    const optionsSim = { name: "Bot", uuid: "42", gameAddress, ...options };
    const bot = new BotSim(this.world, optionsSim);
    setImmediate(() => this.world.spawnPlayer(bot));
    return addHelpersToBot(bot);
  }

  startTicking(tps = this.tps) {
    if (this.tickTimer && this.tps === tps) return; // already ticking
    this.stopTicking();
    this.tps = tps;
    this.tickTimer = setInterval(() => this.world.doTick(), this.tps);
    this.changeEvent.emit();
  }

  stopTicking() {
    if (!this.tickTimer) return; // already stopped
    clearInterval(this.tickTimer);
    this.tickTimer = undefined;
    this.changeEvent.emit();
  }

  setTps(tps: number) {
    if (this.tickTimer) this.startTicking(tps);
    else this.tps = tps;
    this.changeEvent.emit();
  }

  // useful exports for usage in scripts
  Vec3 = Vec3;
}
