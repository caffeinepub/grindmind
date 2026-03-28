export function haptic(duration = 30) {
  try {
    if (navigator.vibrate) navigator.vibrate(duration);
  } catch {}
}
