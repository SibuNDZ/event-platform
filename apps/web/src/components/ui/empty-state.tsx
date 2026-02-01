import { ReactNode } from 'react';
import { Button } from './button';
import {
  Calendar,
  Users,
  Receipt,
  BarChart3,
  Package,
  FileText,
  LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  calendar: Calendar,
  users: Users,
  receipt: Receipt,
  chart: BarChart3,
  package: Package,
  file: FileText,
};

interface EmptyStateProps {
  icon?: keyof typeof icons | ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const IconComponent =
    typeof icon === 'string' ? icons[icon] || Package : null;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {IconComponent ? (
          <IconComponent className="w-8 h-8 text-muted-foreground" />
        ) : (
          icon
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
