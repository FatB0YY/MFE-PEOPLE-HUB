import { userInitials } from '@people-hub/contracts';
import { mockControlApi } from '@people-hub/api-client';
import { Avatar, AvatarFallback, Switch, cn } from '@people-hub/ui';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';

import { useHostUser } from '../hooks/useHostUser';

const FAILURE_SWITCH_ID = 'simulate-api-failure';

function HeaderLink({ to, children }: { to: string; children: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-1.5 text-sm transition-colors',
          isActive
            ? 'bg-shell-border text-shell-foreground'
            : 'text-shell-muted hover:text-shell-foreground',
        )
      }
    >
      {children}
    </NavLink>
  );
}

export function AppHeader() {
  const { user } = useHostUser();
  const [failureSimulated, setFailureSimulated] = useState(false);

  // The flag now lives on the server side of the mock, so the switch reads it
  // instead of reaching into a module the other micro-frontends also use.
  useEffect(() => {
    let subscribed = true;

    void mockControlApi.isFailureSimulated().then(
      (simulated) => {
        if (subscribed) setFailureSimulated(simulated);
      },
      () => {
        // Cannot read it: leave the switch off rather than guess.
      },
    );

    return () => {
      subscribed = false;
    };
  }, []);

  const handleFailureChange = (checked: boolean) => {
    setFailureSimulated(checked);

    void mockControlApi.setFailureSimulated(checked).then(setFailureSimulated, () => {
      setFailureSimulated(!checked);
    });
  };

  return (
    <header className="bg-shell text-shell-foreground">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-6">
        <span className="rounded-md border border-shell-border px-2 py-1 font-mono text-[10px] font-semibold tracking-widest text-shell-muted uppercase">
          host
        </span>

        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users className="size-4" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold">People Hub</span>
        </div>

        <nav className="ml-6 flex items-center gap-1">
          <HeaderLink to="/">Главная</HeaderLink>
          <HeaderLink to="/profile">Профиль</HeaderLink>
        </nav>

        <div className="ml-auto flex items-center gap-5">
          <div className="flex items-center gap-2">
            <Switch
              id={FAILURE_SWITCH_ID}
              checked={failureSimulated}
              onCheckedChange={handleFailureChange}
            />
            <label htmlFor={FAILURE_SWITCH_ID} className="cursor-pointer text-xs text-shell-muted">
              Сымитировать ошибку API
            </label>
          </div>

          <Avatar>
            <AvatarFallback className="text-sm">{user ? userInitials(user) : '?'}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
