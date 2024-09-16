import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import { RxColOp } from '../../db/types';
import useStore from '../../hooks/useStore';
import { useActivity } from '../../hooks';
import { ActivityListItem } from '../activity/ActivityListItem';

import useLogger from '../../hooks/useLogger';
import { List } from 'antd';

function SortableItem(props: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      css={{ ...style, width: '80%', marginLeft: 'auto', marginRight: 'auto' }}
      {...attributes}
      {...listeners}>
      <ActivityListItem activity={props.activity} />
    </div>
  );
}

export function AuraPath({ activityId }: any) {
  const log = useLogger('AuraPath');
  const { onRxColActivity } = useActivity();

  log.debug('Render');

  const activities = useStore((state) => state.activitySlice.activities);
  const activity = activities.find((a) => a.id === activityId);
  const combos = (activity?.comboIds?.map((id) => ({
    ...activities.find((a) => a.id === id),
  })) || []) as any;

  log.debug('Render combos', combos);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleUpdate = (items) => {
    onRxColActivity(RxColOp.Update, {
      id: activityId,
      comboIds: items.map((a) => a.id),
    });
  };

  function handleDragEnd(items, event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((a) => a.id === active.id);
      const newIndex = items.findIndex((a) => a.id === over.id);

      const newOrder = arrayMove(items, oldIndex, newIndex);

      handleUpdate(newOrder);
    }
  }

  // TODO: it might be good to replace dnd with use-gesture + spring.
  // There is a bug/interference between spring outside canvas and spring
  // inside canvas used by auras.

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd.bind(null, combos)}>
      <div
        css={{
          padding: 18,
          width: '100%',
          height: 'calc(100% - 64px - 32px)',
          overflowY: 'auto',
        }}>
        <SortableContext
          items={combos}
          strategy={verticalListSortingStrategy}>
          {combos.map((a) => (
            <SortableItem
              key={a.id}
              id={a.id}
              activity={a}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}
