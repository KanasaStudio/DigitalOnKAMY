/** Short entrance for each Studio page; the shell itself stays put. */
export default function StudioTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
