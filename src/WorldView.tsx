import React from "react";
import { World } from "./model/World";

export default function WorldView({
  world,
  screenRange = 10,
}: {
  world: World;
  screenRange?: number;
}) {
  // TODO if no followed player: center among all entities/chunks
  const center = world.players[world.followedPlayerUUID!];
  const view = { screenRange, x: center.x, z: center.z };

  const viewBox = [
    -view.screenRange,
    -view.screenRange,
    2 * view.screenRange,
    2 * view.screenRange,
  ].join(" ");

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={viewBox}
    >
      <g
        className="WorldView-translate-world"
        transform={`translate(${-view.x} ${-view.z})`}
      >
        <BlocksLayer world={world} />
        <PlayersLayer world={world} />
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

const BlocksLayer = ({ world }: { world: World }) => (
  <g className="WorldView-blocks">
    {Object.values(world.chunks).flatMap(({ cx, cz, blocks }) =>
      Object.values(blocks)
        .map(({ material }, i) => {
          const x = cx * 16 + (i % 16);
          const z = cz * 16 + Math.floor(i / 16);
          const fill = materialColors[material];
          if (!fill) return null;
          return (
            <rect
              key={`${x} ${z}`}
              x={x}
              y={z}
              width={1.01}
              height={1.01}
              fill={fill}
            />
          );
        })
        .filter((elem) => elem)
    )}
  </g>
);

const materialColors: Record<string, string> = {
  "minecraft:stone": "gray",
  "minecraft:gold_block": "gold",
};
