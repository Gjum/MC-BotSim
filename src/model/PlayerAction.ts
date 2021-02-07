import { Player, UUID } from "./Player";

export type PlayerAction = { uuid: UUID } & {
  type: "player:move";
  x: number;
  y: number;
  z: number;
};

export function reducePlayer(player: Player, action: PlayerAction): Player {
  if (player.uuid !== action.uuid) return player;
  switch (action.type) {
    case "player:move":
      return {
        ...player,
        x: action.x,
        y: action.y,
        z: action.z,
      };

    default:
      return player;
  }
}
