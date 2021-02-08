/** @param {import("../bot/Environment").Environment} env */
export default async function (env) {
  const { Vec3 } = env;

  const bot = await env.makeBot("localhost", { name: "Bot" });

  const goal = new Vec3(2, 0, 0);
	const closeEnough = 0.3;
  try {
    while (bot.position.xzDistanceTo(goal) > closeEnough) {
      await bot.lookHorizontal(goal);
      bot.setControlState("forward", true);
    }
  } finally {
    bot.setControlState("forward", false);
  }
}
