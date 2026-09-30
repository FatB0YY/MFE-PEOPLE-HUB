import './styles.css';

import { profileCompleteness, userFullName, userInitials, type User } from '@people-hub/contracts';
import { Alert, Avatar, AvatarFallback, Button, Card, ModuleBadge, Skeleton } from '@people-hub/ui';

import { useUserSnapshot } from './hooks/useUserSnapshot';

function SummarySkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <Skeleton className="size-20 rounded-full" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-52" />
      <Skeleton className="h-9 w-44 rounded-full" />
    </div>
  );
}

function UserSummary({ user }: { user: User }) {
  const completeness = profileCompleteness(user);

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <Avatar className="size-20">
        <AvatarFallback className="text-2xl">{userInitials(user)}</AvatarFallback>
      </Avatar>

      <div className="space-y-1">
        <p className="text-lg font-semibold">{userFullName(user) || 'Имя не указано'}</p>
        <p className="text-sm text-muted-foreground">{user.position || 'Должность не указана'}</p>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm">
        <span className="size-2 rounded-full bg-success" aria-hidden="true" />
        <span className="text-muted-foreground">Профиль заполнен на</span>
        <span className="font-semibold text-foreground">{completeness}%</span>
      </div>
    </div>
  );
}

/**
 * The module exposed to the host. It knows nothing about the form that edits
 * this user: the only thing they have in common is the contract.
 */
export default function SummaryCard() {
  const { status, user, error, reload } = useUserSnapshot();

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <ModuleBadge>mfe: summary</ModuleBadge>
        <span className="font-mono text-xs text-muted-foreground">localhost:3002</span>
      </div>

      <div className="p-6">
        {status === 'loading' && <SummarySkeleton />}

        {status === 'error' && (
          <div className="space-y-3">
            <Alert variant="destructive">{error}</Alert>
            <Button variant="outline" size="sm" onClick={reload}>
              Повторить
            </Button>
          </div>
        )}

        {status === 'ready' && user && <UserSummary user={user} />}
      </div>
    </Card>
  );
}
