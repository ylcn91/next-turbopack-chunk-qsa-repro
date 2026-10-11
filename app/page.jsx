import Widgets from '../components/Widgets';

// ?n=<elements>: size of the static DOM rendered next to the 80 client widgets (each its own async chunk).
export default async function Page({ searchParams }) {
  const { n } = await searchParams;
  const elements = Math.max(0, Math.min(20000, Number(n) || 4000));
  const cards = Math.round(elements / 10);
  return (
    <main>
      <section>
        <Widgets />
      </section>
      <section>
        {Array.from({ length: cards }, (_, i) => (
          <article key={i} className={`card c${i}`} data-id={i}>
            <div className="a">
              <img alt="" width="1" height="1" />
              <span>title {i}</span>
            </div>
            <div className="b">
              <a href={`#item-${i}`}>link</a>
              <p>text</p>
              <ul>
                <li>1</li>
                <li>2</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
