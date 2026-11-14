/** Stagger helper: `{...reveal(2)}` gives the third item a small delay. */
export function reveal(index = 0, step = 60) {
  return { "data-reveal": "", style: { ["--reveal-delay" as string]: `${Math.min(index, 8) * step}ms` } };
}
