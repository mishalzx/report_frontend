interface StrapiErrorsProps {
    error: string[] | null;
  }
  
  export const StrapiErrors: React.FC<StrapiErrorsProps> = ({ error }) => {
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
  