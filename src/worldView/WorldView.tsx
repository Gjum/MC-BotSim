import React, { useState } from "react";
import { UUID } from "../api/Bot";
import { XYZ } from "../api/Vec3";
import { CHUNK_HEIGHT } from "../botSimulator/Chunk";
import { World } from "../botSimulator/World";
import { BlocksPerspective } from "./BlocksPerspective";
import { useOnChange } from "../hooks";
import { PlayersLayer } from "./PlayersLayer";
import "./WorldView.css";

const scrollStep = 53;

export default function WorldView({
  world,
  followedPlayerUUID,
  screenRange: screenRangeDefault = 3,
}: {
  world: World;
  followedPlayerUUID?: UUID;
  screenRange?: number;
}) {
  useOnChange(world);

  // TODO by default, center among all entities/chunks
  let center = { x: 0.5, y: 0, z: 0.5 };
  if (followedPlayerUUID) {
    const followedPlayer = world.getBotByUUID(followedPlayerUUID);
    if (followedPlayer) center = followedPlayer.position;
  }

  const [screenRange, setScreenRange] = useState(screenRangeDefault);

  const view: View = {
    x: center.x,
    y: 0,
    z: center.z,
    range: screenRange,
    topY: CHUNK_HEIGHT,
  };
  const projection = new TopDownPerspective(view);

  const fontSize = (screenRange * 2) / 24;

  const viewBox = [
    -screenRange,
    -screenRange,
    2 * screenRange,
    2 * screenRange,
  ].join(" ");

  function onWheel(e: React.WheelEvent<SVGSVGElement>) {
    const f = Math.pow(1.1, e.deltaY / scrollStep);
    if (f) setScreenRange(screenRange * f);
  }

  const players = world.getPlayers();

  return (
    <svg
      className="WorldView"
      viewBox={viewBox}
      width="100%"
      height="100%"
      onWheel={onWheel}
    >
      <g className="WorldView-translate-world">
        <BlocksPerspective {...{ world, projection }} />
        <PlayersLayer {...{ players, projection, fontSize }} />
      </g>
    </svg>
  );
}

export type XZ = { x: number; z: number };
export interface Projection {
  readonly view: View;
  screenFromWorld(pos: XYZ): XZ;
}

export interface View {
  x: number;
  y: number;
  z: number;
  range: number;
  /**
   * Any blocks higher than this will not render.
   * Useful in the nether or for underground stuff.
   */
  topY: number;
}

export class TopDownPerspective implements Projection {
  readonly view: View;
  constructor(view: View) {
    this.view = view;
  }
  screenFromWorld(pos: XYZ): XZ {
    const dx = pos.x - this.view.x;
    const dy = pos.y - this.view.y;
    const dz = pos.z - this.view.z;
    const scale = Math.pow(1.1, dy);
    return {
      x: dx * scale,
      z: dz * scale,
    };
  }
}
