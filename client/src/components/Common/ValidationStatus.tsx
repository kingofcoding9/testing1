import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

interface ValidationStatusProps {
  validation: ValidationResult;
  className?: string;
}

export default function ValidationStatus({ validation, className = "" }: ValidationStatusProps) {
  const { isValid, errors = [], warnings = [] } = validation;

  if (isValid && warnings.length === 0) {
    return (
      <div className={`p-3 bg-green-500/10 border border-green-500 rounded-lg ${className}`} data-testid="validation-success">
        <div className="flex items-center text-green-600">
          <CheckCircle className="mr-2" size={16} />
          <span className="text-sm font-medium">Valid JSON</span>
        </div>
        <p className="text-sm text-green-600 mt-1">Ready to export and use in Minecraft</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`} data-testid="validation-status">
      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <Badge variant={isValid ? "default" : "destructive"} className="flex items-center">
          {isValid ? (
            <CheckCircle className="mr-1" size={14} />
          ) : (
            <AlertCircle className="mr-1" size={14} />
          )}
          {isValid ? 'Valid' : 'Invalid'}
        </Badge>
        
        {warnings.length > 0 && (
          <Badge variant="secondary" className="flex items-center">
            <AlertTriangle className="mr-1" size={14} />
            {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
          <h4 className="font-medium text-destructive mb-2 flex items-center">
            <AlertCircle className="mr-2" size={16} />
            {errors.length} Error{errors.length !== 1 ? 's' : ''} Found
          </h4>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-destructive flex items-start">
                <span className="mr-2">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500 rounded-lg">
          <h4 className="font-medium text-yellow-600 mb-2 flex items-center">
            <AlertTriangle className="mr-2" size={16} />
            {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
          </h4>
          <ul className="space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-600 flex items-start">
                <span className="mr-2">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success with warnings */}
      {isValid && warnings.length > 0 && (
        <div className="p-3 bg-blue-500/10 border border-blue-500 rounded-lg">
          <div className="flex items-center text-blue-600">
            <CheckCircle className="mr-2" size={16} />
            <span className="text-sm font-medium">Valid with warnings</span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Your JSON is valid but consider addressing the warnings above
          </p>
        </div>
      )}
    </div>
  );
}
