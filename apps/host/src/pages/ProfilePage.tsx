import { EventPulse } from '../components/EventPulse';
import { PageHeading } from '../components/PageHeading';
import { RemoteBoundary } from '../components/RemoteBoundary';
import { loadRemoteComponent } from '../lib/remote-module';

// Type-only imports: they resolve against the declarations Module Federation
// generates from the running remotes, and disappear at runtime.
type ProfileAppModule = typeof import('profile/ProfileApp');
type SummaryCardModule = typeof import('summary/SummaryCard');

// Module-level loaders: stable identity, so retrying is the only thing that
// ever builds a new lazy component.
const loadProfileApp = () => loadRemoteComponent<ProfileAppModule>('profile/ProfileApp');
const loadSummaryCard = () => loadRemoteComponent<SummaryCardModule>('summary/SummaryCard');

export function ProfilePage() {
  return (
    <div className="space-y-8">
      <PageHeading
        fallbackTitle="Профиль"
        subtitle="Изменения синхронизируются между независимыми модулями"
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_auto_minmax(0,1fr)]">
        <RemoteBoundary remoteName="profile" loader={loadProfileApp} />
        <EventPulse />
        <RemoteBoundary remoteName="summary" loader={loadSummaryCard} />
      </div>
    </div>
  );
}
