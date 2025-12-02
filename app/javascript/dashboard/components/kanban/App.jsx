
import KanbanBoardSimple from './components/KanbanBoardSimple';
import './index.css';

export default function KanbanApp({
  contacts,
  attribute,
  onContactMove,
  accountId,
  loading,
}) {
  return (
    <div className="kanban-app">
      <KanbanBoardSimple
        contacts={contacts}
        attribute={attribute}
        onContactMove={onContactMove}
        loading={loading}
      />
    </div>
  );
}
