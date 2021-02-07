export interface Block {
  material: string;
  // TODO
}

export const MATERIAL_AIR = "minecraft:air";

export const emptyBlock: Block = {
  material: MATERIAL_AIR,
};
