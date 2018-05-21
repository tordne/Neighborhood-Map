/**
 * Calculate a random color
 *
 * @export
 @ retruns a hexidecimal number
 *
 */
export function getRandColor() {
  // Get a random number between 0 - 1 and multiply by 18 bits.
  // If positive add as color else add 0.
  // .toString(16) turn the number in a hex
  // .slice(-6) only take the last 6 characters
  let color = "#" + ('00000' + (Math.random() *
    (1 << 18) | 0).toString(16)).slice(-6);

  return color;
}