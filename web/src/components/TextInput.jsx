export default function TextInput({ id, label, error, ...props }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={`input-wrap ${error ? 'has-error' : ''}`}>
        <input id={id} {...props} />
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}