import React, { useRef, useState } from 'react';

// 1. DANH SÁCH STICKER MẪU (Bạn có thể thay bằng link ảnh mèo, chó tùy thích)
const STICKERS = [
    "https://cdn-icons-png.flaticon.com/512/4712/4712109.png", // Like
    "https://cdn-icons-png.flaticon.com/512/4712/4712009.png", // Heart
    "https://cdn-icons-png.flaticon.com/512/4712/4712139.png", // Haha
    "https://cdn-icons-png.flaticon.com/512/4712/4712027.png", // Wow
];

function MessageInput({ newMessage, onNewMessageChange, onSendMessage, onSendImage }) {
    const fileInputRef = useRef(null);
    const [showStickers, setShowStickers] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // --- XỬ LÝ CHỌN FILE (ẢNH/VIDEO) ---
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) onSendImage(file);
    };

    // --- XỬ LÝ GỬI STICKER ---
    const handleSendSticker = (stickerUrl) => {
        // Gửi sticker thực chất là gửi cái link ảnh đó đi thôi
        // Ta dùng hàm onSendImage (dù tên là image nhưng nó xử lý gửi file/link)
        // Tuy nhiên, onSendImage của bạn đang mong đợi 1 FILE object để upload Cloudinary.
        // TRICK: Ta có thể fetch link đó về thành Blob -> File rồi gửi,
        // HOẶC sửa Chat.jsx để nhận URL trực tiếp.

        // Cách đơn giản nhất: Gửi URL sticker như một tin nhắn Text
        // Nhưng để Chat.jsx xử lý đồng bộ, ta nên fetch nó thành file blob rồi gửi upload (hơi thừa nhưng an toàn với code cũ)
        fetch(stickerUrl)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "sticker.png", { type: "image/png" });
                onSendImage(file);
                setShowStickers(false);
            });
    };

    // --- XỬ LÝ GHI ÂM (VOICE) ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                // Tạo file audio từ các chunk
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], "voice_message.webm", { type: 'audio/webm' });

                // Gửi file audio này lên Cloudinary
                onSendImage(audioFile);

                // Tắt stream mic
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Không thể truy cập Microphone:", err);
            alert("Vui lòng cấp quyền Microphone để ghi âm!");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="message-input-container" style={{position: 'relative'}}>

            {/* KHUNG CHỌN STICKER */}
            {showStickers && (
                <div style={{
                    position: 'absolute', bottom: '60px', left: '10px',
                    background: 'white', border: '1px solid #ccc', borderRadius: '10px',
                    padding: '10px', display: 'flex', gap: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    {STICKERS.map((s, i) => (
                        <img
                            key={i} src={s} alt="sticker"
                            style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                            onClick={() => handleSendSticker(s)}
                        />
                    ))}
                </div>
            )}

            <form className="message-input-form" onSubmit={onSendMessage}>
                <input
                    type="file"
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />

                {/* 1. NÚT CHỌN ẢNH/VIDEO */}
                <button
                    type="button"
                    className="btn-icon"
                    onClick={() => fileInputRef.current.click()}
                    style={{ marginRight: '5px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
                    title="Gửi Ảnh/Video"
                >
                    📷
                </button>

                {/* 2. NÚT STICKER */}
                <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setShowStickers(!showStickers)}
                    style={{ marginRight: '5px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
                    title="Gửi Sticker"
                >
                    😜
                </button>

                {/* 3. NÚT GHI ÂM (Nhấn giữ hoặc click bật/tắt) */}
                <button
                    type="button"
                    className="btn-icon"
                    onClick={isRecording ? stopRecording : startRecording}
                    style={{
                        marginRight: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        color: isRecording ? 'red' : 'inherit', // Đỏ khi đang ghi âm
                        animation: isRecording ? 'pulse 1s infinite' : 'none'
                    }}
                    title={isRecording ? "Dừng ghi âm" : "Ghi âm"}
                >
                    {isRecording ? '⏹️' : '🎙️'}
                </button>

                {/* INPUT TEXT */}
                <input
                    type="text"
                    placeholder={isRecording ? "Đang ghi âm..." : "Nhập tin nhắn..."}
                    value={newMessage}
                    onChange={(e) => onNewMessageChange(e.target.value)}
                    className="message-input"
                    disabled={isRecording} // Khóa nhập khi đang ghi âm
                />

                <button type="submit" className="btn-send" disabled={isRecording}>
                    📤 Gửi
                </button>
            </form>

            {/* CSS Animation cho nút ghi âm (Thêm vào file css hoặc style inline) */}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
}

export default MessageInput;
// fix lỗi không nhận input text
