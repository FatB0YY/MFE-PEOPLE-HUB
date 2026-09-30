import type { ProfileEditor } from '../hooks/useProfileEditor';
import {
  CONTACTS_SECTION_NAVIGATION,
  MAIN_SECTION_NAVIGATION,
  UNKNOWN_SECTION_NAVIGATION,
  useNavigationState,
} from '../navigation';
import { FieldGrid, type FieldDescriptor } from './FieldGrid';

const MAIN_FIELDS: FieldDescriptor[] = [
  { field: 'firstName', label: 'Имя' },
  { field: 'lastName', label: 'Фамилия' },
  { field: 'position', label: 'Должность', placeholder: 'Senior frontend developer' },
];

export function MainSection({ editor }: { editor: ProfileEditor }) {
  useNavigationState(MAIN_SECTION_NAVIGATION);
  return <FieldGrid fields={MAIN_FIELDS} editor={editor} />;
}

/**
 * Deliberately has no fields. The tab exists to show nested routing: the host
 * hands the whole prefix over, and the module decides what lives inside it.
 */
export function ContactsSection() {
  useNavigationState(CONTACTS_SECTION_NAVIGATION);

  return (
    <div className="space-y-2 rounded-xl border border-dashed border-border p-6">
      <p className="font-medium">Вкладка для демонстрации роутинга</p>
      <p className="text-sm text-muted-foreground">
        Полей здесь нет: модель содержит только то, что показывает карточка. Вкладка оставлена,
        чтобы было видно вложенный роутинг — адрес меняется на <code>/profile/contacts</code>,
        открывается по прямой ссылке, а несохранённые правки на соседней вкладке при этом не
        теряются.
      </p>
    </div>
  );
}

/** 404 inside the prefix: the host handed this path over and cannot intercept it. */
export function UnknownSection() {
  useNavigationState(UNKNOWN_SECTION_NAVIGATION);

  return (
    <div className="space-y-2 rounded-xl border border-dashed border-border p-6">
      <p className="font-medium">Раздел не найден</p>
      <p className="text-sm text-muted-foreground">
        Такого раздела профиля нет. Этот маршрут находится внутри префикса, который оболочка уже
        передала модулю, поэтому обрабатывает его модуль, а не хост.
      </p>
    </div>
  );
}
