interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        Strength: {strengthLabels[strength - 1] || 'Too weak'}
      </p>
      <ul className="text-xs space-y-1">
        <li className={checks.length ? 'text-green-600' : 'text-gray-500'}>
          {checks.length ? '✓' : '○'} At least 8 characters
        </li>
        <li className={checks.uppercase ? 'text-green-600' : 'text-gray-500'}>
          {checks.uppercase ? '✓' : '○'} One uppercase letter
        </li>
        <li className={checks.lowercase ? 'text-green-600' : 'text-gray-500'}>
          {checks.lowercase ? '✓' : '○'} One lowercase letter
        </li>
        <li className={checks.number ? 'text-green-600' : 'text-gray-500'}>
          {checks.number ? '✓' : '○'} One number
        </li>
        <li className={checks.special ? 'text-green-600' : 'text-gray-500'}>
          {checks.special ? '✓' : '○'} One special character
        </li>
      </ul>
    </div>
  );
}
