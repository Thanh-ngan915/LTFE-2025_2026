import React from 'react';

function RoomsList({ rooms, selectedRoom, onSelectRoom }) {
  return (
    <div className="rooms-list">
      {rooms.length === 0 ? (
        <p className="no-rooms">No rooms available</p>
      ) : (
        rooms.map((room, index) => (
          <div
            key={index}
            className={`room-item ${selectedRoom?.name === room.name ? 'active' : ''}`}
            onClick={() => onSelectRoom(room)}
          >
            <span className="room-icon">🏠</span>
            <div className="room-info">
              <p className="room-name">{room.name || room}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default RoomsList;
