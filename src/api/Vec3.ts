export interface XYZ {
  x: number;
  y: number;
  z: number;
}

export class Vec3 implements XYZ {
  readonly x: number = 0;
  readonly y: number = 0;
  readonly z: number = 0;

  constructor(first?: number | XYZ, y?: number, z?: number) {
    if (first === undefined) {
      // keep default 0,0,0
    } else if (typeof first === "number") {
      this.x = first;
      this.y = y!;
      this.z = z!;
    } else {
      this.x = first.x;
      this.y = first.y;
      this.z = first.z;
    }
  }

  floored() {
    return new Vec3(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
  }

  minus(other: XYZ) {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  plus(other: XYZ) {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  xzDistanceTo(other: Vec3) {
    const dx = this.x - other.x;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}

export default Vec3;
