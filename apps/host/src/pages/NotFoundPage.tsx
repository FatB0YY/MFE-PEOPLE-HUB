import { Button } from '@people-hub/ui';
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Страница не найдена</h1>
      <p className="text-sm text-muted-foreground">Такого маршрута в оболочке нет.</p>
      <Button asChild variant="outline" size="sm">
        <Link to="/">На главную</Link>
      </Button>
    </div>
  );
}
