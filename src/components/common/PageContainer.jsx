export default function PageContainer({ eyebrow, title, intro, children }) {
  return <div className="container page"><header className="page-heading">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{intro && <p className="intro">{intro}</p>}</header>{children}</div>;
}
