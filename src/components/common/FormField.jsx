export default function FormField({ label, id, hint, children, ...props }) {
  return <div className="field"><label htmlFor={id}>{label}</label>{children || <input id={id} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />}{hint && <small id={`${id}-hint`}>{hint}</small>}</div>;
}
