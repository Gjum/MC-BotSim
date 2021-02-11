import { Environment } from "../api/Environment";

export default async function (env: Environment) {
  const bot = await env.makeBot("localhost", { name: "Bot" });
  await bot.connect();
  while (bot.connectionStatus === "online") {
    bot.setControlState("forward", true);
    const { yaw, pitch } = bot.look;
    await bot.lookRadians(yaw + 0.1, pitch);
  }
}
