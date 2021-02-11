export interface YawPitch {
  yaw: number;
  pitch: number;
}

/** stores angles in radians */
export class Look implements YawPitch {
  readonly yaw: number;
  readonly pitch: number;

  get yawDeg() {
    return 180 - (this.yaw * 180) / Math.PI;
  }
  get pitchDeg() {
    return -(this.pitch * 180) / Math.PI;
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

  static fromDegrees(yaw: number, pitch: number) {
    yaw = 180 - yaw;
    pitch = -pitch;
    return new Look((yaw * Math.PI) / 180, (pitch * Math.PI) / 180);
  }
}

export default Look;
