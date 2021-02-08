import Look from "./Look";

test("converts degrees", () => {
  for (let yaw = -180; yaw <= 360; yaw += 45) {
    for (let pitch = -90; pitch <= 90; pitch += 45) {
      const a = Look.fromDegrees(yaw, pitch);
      expect(a.yawDeg).toBeCloseTo(yaw, 4);
      expect(a.pitchDeg).toBeCloseTo(pitch, 4);
    }
  }
});
