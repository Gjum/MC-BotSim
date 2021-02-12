import Vec3 from "./Vec3";

export interface YawPitch {
  yaw: number;
  pitch: number;
}

/**
 * Stores angles in radians.
 * Minecraft's angles are different from the "typical" geometry.
 * For yaw, south is 0, west is +90, east is -90.
 * For pitch, straight is 0, down is +90, up is -90.
 */
export class Look implements YawPitch {
  readonly yaw: number;
  readonly pitch: number;

  get yawDeg() {
    return (this.yaw * 180) / Math.PI;
  }
  get pitchDeg() {
    return (this.pitch * 180) / Math.PI;
  }

  /** argument angles are in radians */
  constructor(yaw: number | YawPitch, pitch?: number) {
    if (typeof yaw === "number") {
      this.yaw = yaw;
      this.pitch = pitch!;
    } else {
      const yawPitch = yaw;
      this.yaw = yawPitch.yaw;
      this.pitch = yawPitch.pitch;
    }
  }

  static SOUTH = new Look(0, 0);
  static WEST = new Look(90, 0);
  static NORTH = new Look(180, 0);
  static EAST = new Look(-90, 0);
  static DOWN = new Look(0, 90);
  static UP = new Look(0, -90);

  static fromDegrees(yaw: number, pitch: number) {
    return new Look((yaw * Math.PI) / 180, (pitch * Math.PI) / 180);
  }

  static fromVec(vec: Vec3) {
    const yaw = Math.atan2(-vec.x, vec.z);
    const groundDistance = Math.sqrt(vec.x * vec.x + vec.z * vec.z);
    const pitch = Math.atan2(vec.y, groundDistance);
    return new Look(yaw, pitch);
  }

  toVec3() {
    return new Vec3(
      -Math.cos(this.pitch) * Math.sin(this.yaw),
      -Math.sin(this.pitch),
      Math.cos(this.pitch) * Math.cos(this.yaw)
    );
  }
}

export default Look;
