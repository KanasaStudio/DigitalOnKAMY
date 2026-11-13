/**
 * Renders stored policy text as plain React elements. Lines starting with "## " become
 * headings; blank lines separate paragraphs. No HTML is ever interpreted.
 */
export function PolicyBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-silver">
      {blocks.map((block, index) => {
        const [first, ...rest] = block.split("\n");
        if (first.startsWith("## ")) {
          return (
            <div key={index} className="flex flex-col gap-1.5">
              <h3 className="text-sm font-bold text-cloud">{first.slice(3)}</h3>
              {rest.length ? <p>{rest.join(" ")}</p> : null}
            </div>
          );
        }
        return <p key={index}>{block.replace(/\n/g, " ")}</p>;
      })}
    </div>
  );
}
