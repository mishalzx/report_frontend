interface ZodErrorsProps {
  error: string[] | undefined;
}

export const ZodErrors: React.FC<ZodErrorsProps> = ({ error }) => {
  if (!error || error.length === 0) return null;

  return (
    <ul>
      {error.map((err, index) => (
        <li key={index} className="text-danger">
          {err}
        </li>
      ))}
    </ul>
  );
};
