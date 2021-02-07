export type UUID = string; // TODO

export interface Player {
  name: string;
  uuid: UUID;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

export function makePlayer(uuid: UUID, name: string): Player {
  return { uuid, name, x: 0, y: 0, z: 0, yaw: 0, pitch: 0 };
}
