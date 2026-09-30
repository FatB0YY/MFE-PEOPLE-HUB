import { Card, ModuleBadge } from '@people-hub/ui';
import { Link } from 'react-router';

const MODULES = [
  {
    badge: 'host',
    port: 3000,
    description: 'Оболочка: владеет страницей, адресной строкой, шапкой и раскладкой.',
  },
  {
    badge: 'mfe: profile',
    port: 3001,
    description: 'Отображает и редактирует профиль, публикует событие после сохранения.',
  },
  {
    badge: 'mfe: summary',
    port: 3002,
    description: 'Показывает карточку того же пользователя и слушает событие.',
  },
];

export function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">People Hub</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Оболочка и два независимых микрофронтенда. Друг о друге модули не знают: общими у них
          являются только типы домена и шина событий.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {MODULES.map((module) => (
          <Card key={module.badge} className="space-y-3 p-5">
            <ModuleBadge>{module.badge}</ModuleBadge>
            <p className="text-sm text-foreground">{module.description}</p>
            <p className="font-mono text-xs text-muted-foreground">localhost:{module.port}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-2 p-5">
        <p className="font-medium">Что посмотреть</p>
        <p className="text-sm text-muted-foreground">
          Откройте{' '}
          <Link to="/profile" className="text-primary underline underline-offset-4">
            Профиль
          </Link>
          , измените имя и нажмите «Сохранить»: карточка справа обновится без перезагрузки страницы.
          Остановите dev-сервер на порту 3002 — страница продолжит работать, а на месте карточки
          появится плашка с кнопкой повтора.
        </p>
      </Card>
    </div>
  );
}
