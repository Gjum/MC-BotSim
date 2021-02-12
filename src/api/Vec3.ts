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

  withX(x: number) {
    return new Vec3(x, this.y, this.z);
  }
  withY(y: number) {
    return new Vec3(this.x, y, this.z);
  }
  withZ(z: number) {
    return new Vec3(this.x, this.y, z);
  }

  floored() {
    return new Vec3(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
  }

  scaled(scalar: number) {
    return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  minus(x: XYZ): Vec3;
  minus(x: number, y: number, z: number): Vec3;
  minus(x: XYZ | number, y?: number, z?: number) {
    if (typeof x === "object") {
      const other = x as XYZ;
      x = other.x;
      y = other.y;
      z = other.z;
    }
    return new Vec3(this.x - x, this.y - y!, this.z - z!);
  }

  plus(x: XYZ): Vec3;
  plus(x: number, y: number, z: number): Vec3;
  plus(x: XYZ | number, y?: number, z?: number): Vec3 {
    if (typeof x === "object") {
      const other = x as XYZ;
      x = other.x;
      y = other.y;
      z = other.z;
    }
    return new Vec3(this.x + x, this.y + y!, this.z + z!);
  }

  distanceSquared(other: Vec3): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return dx * dx + dy * dy + dz * dz;
  }

  distanceTo(other: Vec3): number {
    return Math.floor(this.distanceSquared(other));
  }

  xzDistanceTo(other: Vec3): number {
    const dx = this.x - other.x;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}

export default Vec3;
