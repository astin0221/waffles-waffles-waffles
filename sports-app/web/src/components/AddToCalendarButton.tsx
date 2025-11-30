import React from 'react';
import Button from './Button';

interface AddToCalendarButtonProps {
  eventId: number;
  isInCalendar: boolean;
  onToggle: (eventId: number) => void;
  loading?: boolean;
}

const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({
  eventId,
  isInCalendar,
  onToggle,
  loading = false,
}) => {
  return (
    <Button
      variant={isInCalendar ? 'danger' : 'primary'}
      onClick={() => onToggle(eventId)}
      isLoading={loading}
    >
      {isInCalendar ? 'Remove from Calendar' : 'Add to Calendar'}
    </Button>
  );
};

export default AddToCalendarButton;