/** Only mount VisionCamera when permission is granted and the game is using the camera. */
export function shouldMountLipCamera(
  active: boolean,
  useCamera: boolean,
  hasCamera: boolean,
  device: unknown,
  frameProcessor: unknown,
): boolean {
  return active && useCamera && hasCamera && Boolean(device && frameProcessor);
}
