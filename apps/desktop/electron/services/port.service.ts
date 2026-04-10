/** Genera un puerto aleatorio en el rango efímero para el backend. */
export function generatePort(): number {
  return Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152
}
