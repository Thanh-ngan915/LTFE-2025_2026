import React from 'react';

function TabSection({ tab, onTabChange }) {
  return (
    <div className="tabs">
      <button
        className={`tab ${tab === 'messages' ? 'active' : ''}`}
        onClick={() => onTabChange('messages')}
      >
        💬 Messages
      </button>
      <button
        className={`tab ${tab === 'rooms' ? 'active' : ''}`}
        onClick={() => onTabChange('rooms')}
      >
        🏠 Rooms
      </button>
    </div>
  );
}

export default TabSection;
