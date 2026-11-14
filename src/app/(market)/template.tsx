/** Re-mounts on every navigation, giving each page a short entrance (opacity + 8px, 320ms). */
export default function MarketTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
