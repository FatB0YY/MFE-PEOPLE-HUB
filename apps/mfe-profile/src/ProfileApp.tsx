import './styles.css';

import { Alert, Button, Card, ModuleBadge } from '@people-hub/ui';
import { Route, Routes, useMatch } from 'react-router';

import { EditorFooter, TabStrip } from './components/EditorShell';
import { ContactsSection, MainSection, UnknownSection } from './components/sections';
import { useMountPath } from './hooks/useMountPath';
import { useProfileEditor } from './hooks/useProfileEditor';

/**
 * The module exposed to the host. It takes no props: the event bus, the data
 * access and the design system all arrive through the shared contract.
 */
export default function ProfileApp() {
  const editor = useProfileEditor();
  const mountPath = useMountPath();

  // The save bar belongs to the section that has the fields, and only to it.
  const isFormSection = useMatch(mountPath) !== null;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <ModuleBadge>mfe: profile</ModuleBadge>
        <span className="font-mono text-xs text-muted-foreground">localhost:3001</span>
      </div>

      <div className="space-y-6 p-6">
        <TabStrip mountPath={mountPath} />

        {editor.status === 'error' ? (
          <div className="space-y-3">
            <Alert variant="destructive">{editor.loadError}</Alert>
            <Button variant="outline" size="sm" onClick={editor.reload}>
              Повторить
            </Button>
          </div>
        ) : (
          <Routes>
            <Route index element={<MainSection editor={editor} />} />
            <Route path="contacts" element={<ContactsSection />} />
            <Route path="*" element={<UnknownSection />} />
          </Routes>
        )}
      </div>

      {editor.status !== 'error' && isFormSection && <EditorFooter editor={editor} />}
    </Card>
  );
}
