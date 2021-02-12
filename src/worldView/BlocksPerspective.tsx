import { Block, emptyBlock, MATERIAL_AIR } from "../botSimulator/Block";
import { Chunk } from "../botSimulator/Chunk";
import { World } from "../botSimulator/World";
import { Projection, View } from "./WorldView";

export const BlocksPerspective = ({
  world,
  projection,
}: {
  world: World;
  projection: Projection;
}) => {
  const view = projection.view;
  const blockFacesByY = computeVisibleBlockFaces(world, view);
  const sortedSlices = Object.entries(blockFacesByY).sort(
    (a, b) => +a[0] - +b[0]
  );
  return (
    <g className="WorldView-blocks">
      {sortedSlices.map(([i, blockFaces]) => (
        <g key={i}>
          {blockFaces
            .map(({ x, y, z, block, dx, dz }) => {
              const key = `${x} ${z} ${dx} ${dz}`;
              const isTopFace = dx === 0 && dz === 0;
              const fill = isTopFace
                ? materialColors[block.material] || "#f0f"
                : "#333"; // TODO properly darken the block color for side faces
              if (!fill) return null;
              if (isTopFace) {
                const p = projection.screenFromWorld({ x, y, z });
                const pos2 = { x: x + 1, y, z: z + 1 };
                const p2 = projection.screenFromWorld(pos2);
                return (
                  <rect
                    key={key}
                    x={p.x}
                    y={p.z}
                    width={p2.x - p.x}
                    height={p2.z - p.z}
                    fill={fill}
                  />
                );
              } else {
                const persp = getFaceCornersInPerspective(x, y, z, dx, dz);
                const proj = persp.map(([x, y, z]) =>
                  projection.screenFromWorld({ x, y, z })
                );
                return (
                  <polygon
                    key={key}
                    points={proj.map((p) => `${p.x},${p.z}`).join(" ")}
                    fill={fill}
                  />
                );
              }
            })
            .filter((elem) => elem)}
        </g>
      ))}
    </g>
  );
};

interface BlockFace {
  block: Block;
  x: number;
  y: number;
  z: number;
  dx: number;
  dz: number;
}

const sideDeltasXZ = [
  [-1, 0], // west
  [0, -1], // north
  [1, 0], // east
  [0, 1], // south
];

function computeVisibleBlockFaces(world: World, view: View) {
  const blockFacesByY: Record<number, BlockFace[]> = {};

  // XXX get world extent properly
  const cxs = (Object.values((world as any).chunks) as Chunk[]).map(
    (c) => c.cx
  );
  const xMin = Math.max(Math.floor(view.x - view.range), 16 * Math.min(...cxs));
  const xMax = Math.min(
    Math.floor(view.x + view.range),
    16 * Math.max(...cxs) + 15
  );
  const czs = (Object.values((world as any).chunks) as Chunk[]).map(
    (c) => c.cz
  );
  const zMin = Math.max(Math.floor(view.z - view.range), 16 * Math.min(...czs));
  const zMax = Math.min(
    Math.floor(view.z + view.range),
    16 * Math.max(...czs) + 15
  );

  for (let z = zMin; z <= zMax; ++z) {
    for (let x = xMin; x <= xMax; ++x) {
      let topY = world.getHeight(x, z);
      if (topY === null) continue; // unloaded chunk
      if (topY > view.topY) topY = view.topY;
      let aboveBlock = emptyBlock;
      for (let y = topY; y >= 0; --y) {
        const block = world.getBlock(x, y, z) || emptyBlock;
        if (block.material !== MATERIAL_AIR) {
          if (aboveBlock.material === MATERIAL_AIR) {
            const sliceTop =
              blockFacesByY[y * 2 + 1] || (blockFacesByY[y * 2 + 1] = []);
            sliceTop.push({ block, x, y, z, dx: 0, dz: 0 });
          }
          const sides: BlockFace[] = [];
          for (const [dx, dz] of sideDeltasXZ) {
            const adjacentBlock =
              world.getBlock(x + dx, y, z + dz) || emptyBlock;
            if (adjacentBlock.material === MATERIAL_AIR) {
              sides.push({ block, x, y, z, dx, dz });
            }
          }
          if (sides.length) {
            // only create this slice if there are any sides visible
            const sliceSides =
              blockFacesByY[y * 2] || (blockFacesByY[y * 2] = []);
            sliceSides.push(...sides);
          }
        }
        aboveBlock = block;
      }
    }
  }

  return blockFacesByY;
}

function getFaceCornersInPerspective(
  x: number,
  y: number,
  z: number,
  dx: number,
  dz: number
): [number, number, number][] {
  if (dx !== 0) {
    x = x + 0.5 + 0.5 * dx;
    return [
      [x, y - 0, z + 0],
      [x, y - 1, z + 0],
      [x, y - 1, z + 1],
      [x, y - 0, z + 1],
    ];
  } else if (dz !== 0) {
    z = z + 0.5 + 0.5 * dz;
    return [
      [x + 0, y - 0, z],
      [x + 0, y - 1, z],
      [x + 1, y - 1, z],
      [x + 1, y - 0, z],
    ];
  } else {
    return [
      [x + 0, y, z + 0],
      [x + 1, y, z + 0],
      [x + 1, y, z + 1],
      [x + 0, y, z + 1],
    ];
  }
}

const materialColors: Record<string, string | null> = {
  [MATERIAL_AIR]: null,
  "minecraft:stone": "gray",
  "minecraft:gold_block": "gold",
  "minecraft:redstone_block": "red",
  "minecraft:grass": "green",
};
