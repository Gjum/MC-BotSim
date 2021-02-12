import React from "react";
import { Player } from "../api/Bot";
import { Projection } from "./WorldView";

export const PlayersLayer = ({
  players,
  projection,
  fontSize,
}: {
  players: Player[];
  projection: Projection;
  fontSize: number;
}) => (
  <React.Fragment>
    <g className="WorldView-players">
      {players.map(({ uuid, position, look }) => {
        const pos = projection.screenFromWorld(position);
        const r = projection.screenFromWorld(position.plus(0.3, 0, 0)).x;
        const { x: lx, z: lz } = look.toVec3();
        return (
          <React.Fragment key={uuid}>
            <line
              x1={pos.x}
              y1={pos.z}
              x2={pos.x + lx * r}
              y2={pos.z + lz * r}
              stroke="red"
              strokeWidth={0.1}
              strokeLinecap="round"
            />
            <circle
              cx={pos.x}
              cy={pos.z}
              r={r}
              stroke="red"
              strokeWidth={0.1}
              fill="none"
            />
          </React.Fragment>
        );
      })}
    </g>
    <g className="WorldView-playerNames">
      {players.map(({ uuid, name, position }) => {
        const pos = projection.screenFromWorld(position);
        return (
          <g key={uuid}>
            <text
              x={pos.x}
              y={pos.z}
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
              x={pos.x}
              y={pos.z}
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
  </React.Fragment>
);
