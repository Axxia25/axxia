
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoardSimple({
  contacts = [],
  attribute,
  onContactMove,
  loading,
}) {
  // Organizar contatos em colunas
  const organizeContacts = () => {
    if (!attribute || !contacts.length) return {};

    const columns = attribute.attribute_values || [];
    const organized = columns.reduce(
      (acc, col) => {
        acc[col] = [];
        return acc;
      },
      { 'Não definido': [] }
    );

    // Distribuir contatos nas colunas
    contacts.forEach(contact => {
      const value =
        contact.custom_attributes?.[attribute.attribute_key] || 'Não definido';
      if (organized[value]) {
        organized[value].push(contact);
      }
    });

    return organized;
  };

  const board = organizeContacts();
  const columns = attribute?.attribute_values || [];

  const handleDragEnd = result => {
    const { source, destination } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceList = board[source.droppableId] || [];
    const movedContact = sourceList[source.index];

    if (!movedContact) return;

    // Chamar callback do Vue
    const newValue =
      destination.droppableId === 'Não definido'
        ? null
        : destination.droppableId;
    onContactMove?.({
      contactId: movedContact.id,
      newValue: newValue,
      contact: movedContact,
    });
  };

  if (loading) {
    return (
      <div className="kanban-loading">
        <div className="loading-spinner"></div>
        <p>Carregando contatos...</p>
      </div>
    );
  }

  return (
    <div className="kanban-board-container">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-columns">
          {['Não definido', ...columns].map(columnName => (
            <KanbanColumn
              key={columnName}
              stage={columnName}
              contacts={board[columnName] || []}
              attrDisplayNames={{}} // Simplificado por enquanto
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
