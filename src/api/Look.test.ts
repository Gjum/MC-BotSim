import Look from "./Look";
import Vec3 from "./Vec3";

const precision = 4;

test("converts to/from degrees", () => {
  for (let yaw = -180; yaw <= 360; yaw += 45) {
    for (let pitch = -90; pitch <= 90; pitch += 45) {
      const a = Look.fromDegrees(yaw, pitch);
      expect(a.yawDeg).toBeCloseTo(yaw, precision);
      expect(a.pitchDeg).toBeCloseTo(pitch, precision);
    }
  }
});

test("converts from vec", () => {
  expect(Look.fromVec(new Vec3(1, 0, 0)).yawDeg).toBeCloseTo(-90, precision);
  expect(Look.fromVec(new Vec3(0, 0, 1)).yawDeg).toBeCloseTo(0, precision);
  expect(Look.fromVec(new Vec3(-1, 0, 0)).yawDeg).toBeCloseTo(90, precision);
  expect(Math.abs(Look.fromVec(new Vec3(0, 0, -1)).yawDeg)).toBeCloseTo(
    180,
    precision
  );
  expect(Look.fromVec(new Vec3(0, -1, 0)).pitchDeg).toBeCloseTo(-90, precision);
  expect(Look.fromVec(new Vec3(0, 1, 0)).pitchDeg).toBeCloseTo(90, precision);
});
