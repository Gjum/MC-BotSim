import React, { useState } from "react";
import { Block, emptyBlock, MATERIAL_AIR } from "./model/Block";
import { CHUNK_HEIGHT } from "./model/Chunk";
import { getBlockInWorld, getHeightInWorld, World } from "./model/World";
import "./WorldView.css";

interface View {
  x: number;
  z: number;
  range: number;
  topY: number;
}

export default function WorldView({
  world,
  screenRange: screenRangeDefault = 10,
}: {
  world: World;
  screenRange?: number;
}) {
  // TODO if no followed player: center among all entities/chunks
  const center = world.players[world.followedPlayerUUID!];

  const [screenRange, setScreenRange] = useState(screenRangeDefault);

  const view: View = {
    x: center.x,
    z: center.z,
    range: screenRange,
    topY: CHUNK_HEIGHT,
  };

  const fontSize = (screenRange * 2) / 40;

  const viewBox = [
    -screenRange,
    -screenRange,
    2 * screenRange,
    2 * screenRange,
  ].join(" ");

  function onWheel(e: React.WheelEvent<SVGSVGElement>) {
    const f = Math.pow(1.1, e.deltaY / 53);
    if (f) setScreenRange(screenRange * f);
  }

  return (
    <svg className="WorldView" viewBox={viewBox} onWheel={onWheel}>
      <g
        className="WorldView-translate-world"
        transform={`translate(${-view.x} ${-view.z})`}
      >
        <BlocksLayer world={world} view={view} />
        <PlayersLayer world={world} />
        <PlayerNamesLayer world={world} fontSize={fontSize} />
      </g>
    </svg>
  );
}

const PlayersLayer = ({ world }: { world: World }) => (
  <g className="WorldView-players">
    {Object.values(world.players).map(({ uuid, x, z, yaw }) => {
      const r = 0.3;
      const x2 = x - r * Math.sin(yaw);
      const z2 = z + r * Math.cos(yaw);
      return (
        <React.Fragment key={uuid}>
          <line
            x1={x}
            y1={z}
            x2={x2}
            y2={z2}
            stroke="red"
            strokeWidth={0.1}
            strokeLinecap="round"
          />
          <circle
            cx={x}
            cy={z}
            r={r}
            stroke="red"
            strokeWidth={0.1}
            fill="none"
          />
        </React.Fragment>
      );
    })}
  </g>
);

const PlayerNamesLayer = ({
  world,
  fontSize,
}: {
  world: World;
  fontSize: number;
}) => (
  <g className="WorldView-playerNames">
    {Object.values(world.players).map(({ uuid, x, z, name }) => {
      return (
        <g key={uuid}>
          <text
            x={x}
            y={z}
            dy={-0.5}
            textAnchor="middle"
            fontSize={fontSize}
            strokeWidth={fontSize * 0.2}
            stroke="black"
            fill="black"
          >
            {name}
          </text>
          <text
            x={x}
            y={z}
            dy={-0.5}
            textAnchor="middle"
            fontSize={fontSize}
            fill="white"
          >
            {name}
          </text>
        </g>
      );
    })}
  </g>
);

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

  const cxs = Object.values(world.chunks).map((c) => c.cx);
  const xMin = Math.max(Math.floor(view.x - view.range), 16 * Math.min(...cxs));
  const xMax = Math.min(
    Math.floor(view.x + view.range),
    16 * Math.max(...cxs) + 15
  );
  const czs = Object.values(world.chunks).map((c) => c.cz);
  const zMin = Math.max(Math.floor(view.z - view.range), 16 * Math.min(...czs));
  const zMax = Math.min(
    Math.floor(view.z + view.range),
    16 * Math.max(...czs) + 15
  );

  for (let z = zMin; z <= zMax; ++z) {
    for (let x = xMin; x <= xMax; ++x) {
      let topY = getHeightInWorld(world, x, z);
      if (topY === null || topY === undefined) topY = CHUNK_HEIGHT;
      if (topY > view.topY) topY = view.topY;
      let aboveBlock = emptyBlock;
      for (let y = topY; y >= 0; --y) {
        const block = getBlockInWorld(world, x, y, z) || emptyBlock;
        if (block.material !== MATERIAL_AIR) {
          if (aboveBlock.material === MATERIAL_AIR) {
            const sliceTop =
              blockFacesByY[y * 2 + 1] || (blockFacesByY[y * 2 + 1] = []);
            sliceTop.push({ block, x, y, z, dx: 0, dz: 0 });
          }
          const sides: BlockFace[] = [];
          for (const [dx, dz] of sideDeltasXZ) {
            const adjacentBlock =
              getBlockInWorld(world, x + dx, y, z + dz) || emptyBlock;
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

function project(
  dx: number,
  dy: number,
  dz: number
): { px: number; pz: number; scale: number } {
  const scale = Math.pow(1.1, dy);
  const px = dx * scale;
  const pz = dz * scale;
  return { px, pz, scale };
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

const BlocksLayer = ({ world, view }: { world: World; view: View }) => {
  const blockFacesByY = computeVisibleBlockFaces(world, view);
  const sortedSlices = Object.entries(blockFacesByY).sort(
    (a, b) => +a[0] - +b[0]
  );
  return (
    <g
      className="WorldView-blocks"
      transform={`translate(${view.x} ${view.z})`}
    >
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
                const { px, pz, scale } = project(x - view.x, y, z - view.z);
                return (
                  <rect
                    key={key}
                    x={px}
                    y={pz}
                    width={scale}
                    height={scale}
                    fill={fill}
                  />
                );
              } else {
                const persp = getFaceCornersInPerspective(x, y, z, dx, dz);
                const proj: [number, number][] = persp.map(([cx, cy, cz]) => {
                  const { px, pz } = project(cx - view.x, cy, cz - view.z);
                  return [px, pz];
                });
                return (
                  <polygon
                    key={key}
                    points={proj.map(([px, pz]) => `${px},${pz}`).join(" ")}
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

const materialColors: Record<string, string | null> = {
  [MATERIAL_AIR]: null,
  "minecraft:stone": "gray",
  "minecraft:gold_block": "gold",
  "minecraft:redstone_block": "red",
  "minecraft:grass": "green",
};
