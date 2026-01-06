import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isConnected: false,
    isAuthenticated: false,

    conversations: [],
    rooms: [],
    messages: [],
    joinedRooms: [],

    selectedUser: null,
    selectedRoom: null,

    tab: 'messages',
    newMessage: '',
    newRoomName: '',
    searchTerm: '',

    // Room creation state
    roomCreateError: '',
    roomCreateSuccess: '',
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        // --- Connection actions ---
        setIsConnected: (state, action) => {
            state.isConnected = action.payload;
        },
        setIsAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },

        // --- Chat data actions ---
        setConversations: (state, action) => {
            state.conversations = action.payload;
        },
        addConversation: (state, action) => {
            // Chỉ thêm nếu chưa tồn tại để tránh trùng lặp
            if (!state.conversations.includes(action.payload)) {
                state.conversations.unshift(action.payload);
            }
        },

        setRooms: (state, action) => {
            state.rooms = action.payload;
        },
        addRoom: (state, action) => {
            const newRoomName = action.payload.name || action.payload;
            const exists = state.rooms.some(r => (r.name || r) === newRoomName);
            if (!exists) {
                state.rooms.push(action.payload);
            }
        },

        setMessages: (state, action) => {
            const data = action.payload || [];

            const normalize = (item) => {
                if (!item) return item;
                if (typeof item === 'string') return { mes: item, time: new Date().toLocaleString() };
                return {
                    id: item.id,
                    from: item.from || item.name || item.user || item.sender || 'Unknown',
                    mes: item.mes || item.message || item.msg || item.text || '',
                    time: item.time || item.createAt || item.create_at || item.timestamp || item.t || new Date().toLocaleString(),
                    to: item.to,
                    type: item.type,
                };
            };

            const mapped = Array.isArray(data) ? data.map(normalize) : [normalize(data)];

            // Sort ascending by time (oldest first). Parse time to timestamp for comparison.
            const toTimestamp = (t) => {
                if (!t) return 0;
                // If already a number
                if (typeof t === 'number') return t;
                // Try Date.parse, replace space between date/time with 'T' for compatibility
                const iso = String(t).replace(' ', 'T');
                const parsed = Date.parse(iso);
                if (!isNaN(parsed)) return parsed;
                const d = new Date(t);
                return isNaN(d.getTime()) ? 0 : d.getTime();
            };

            mapped.sort((a, b) => toTimestamp(a.time) - toTimestamp(b.time));
            state.messages = mapped;
        },
        addMessage: (state, action) => {
            const incoming = action.payload;

            // Nếu incoming không phải object (ví dụ chuỗi), push luôn
            if (!incoming || typeof incoming !== 'object') {
                state.messages.push(incoming);
                return;
            }

            // Tìm message trùng (dựa trên from + mes + to). Nếu có, cập nhật (thay optimistic bằng server)
            const matchIndex = state.messages.findIndex(m => {
                if (!m || typeof m !== 'object') return false;
                return m.mes === incoming.mes && m.from === incoming.from && (m.to === incoming.to);
            });

            if (matchIndex !== -1) {
                state.messages[matchIndex] = { ...state.messages[matchIndex], ...incoming };
            } else {
                state.messages.push(incoming);
            }
        },
        clearMessages: (state) => {
            state.messages = [];
        },

        setJoinedRooms: (state, action) => {
            state.joinedRooms = action.payload;
        },
        addJoinedRoom: (state, action) => {
            if (!state.joinedRooms.includes(action.payload)) {
                state.joinedRooms.push(action.payload);
            }
        },

        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
            state.selectedRoom = null;
            state.messages = [];
            state.newMessage = '';
            state.roomCreateError = '';
            state.roomCreateSuccess = '';
        },
        setSelectedRoom: (state, action) => {
            state.selectedRoom = action.payload;
            state.selectedUser = null;
            state.messages = [];
            state.newMessage = '';
            state.roomCreateError = '';
            state.roomCreateSuccess = '';
        },
        clearSelection: (state) => {
            state.selectedUser = null;
            state.selectedRoom = null;
            state.messages = [];
        },

        setTab: (state, action) => {
            state.tab = action.payload;

        },
        setNewMessage: (state, action) => {
            state.newMessage = action.payload;
        },
        clearNewMessage: (state) => {
            state.newMessage = '';
        },
        setNewRoomName: (state, action) => {
            state.newRoomName = action.payload;
        },
        clearNewRoomName: (state) => {
            state.newRoomName = '';
        },
        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
        },
        clearSearchTerm: (state) => {
            state.searchTerm = '';
        },

        setRoomCreateError: (state, action) => {
            state.roomCreateError = action.payload;
        },
        setRoomCreateSuccess: (state, action) => {
            state.roomCreateSuccess = action.payload;
        },
        clearRoomCreateMessages: (state) => {
            state.roomCreateError = '';
            state.roomCreateSuccess = '';
        },

        // --- Reset chat (Dùng khi Logout) ---
        resetChat: () => initialState,
    },
});

export const {
    setIsConnected,
    setIsAuthenticated,
    setConversations,
    addConversation,
    setRooms,
    addRoom,
    setMessages,
    addMessage,
    clearMessages,
    setJoinedRooms,
    addJoinedRoom,
    setSelectedUser,
    setSelectedRoom,
    clearSelection,
    setTab,
    setNewMessage,
    clearNewMessage,
    setNewRoomName,
    clearNewRoomName,
    setSearchTerm,
    clearSearchTerm,
    setRoomCreateError,
    setRoomCreateSuccess,
    clearRoomCreateMessages,
    resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;//.