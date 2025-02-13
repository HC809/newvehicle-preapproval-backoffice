// Interface for ProblemDetails (422 or 500)
export interface ProblemDetails {
  title: string;
  status: number;
  detail: string;
  errors?: ValidationError[];
}

// Interface for Error (400)
export interface CustomError {
  code: string;
  description: string;
}

interface ValidationError {
  propertyName: string;
  errorMessage: string;
}
