import { useEffect, useRef, useState, useContext } from "react";
import Picker from '@emoji-mart/react';
import emojiMartData from '@emoji-mart/data';
import { AuthContext } from '../../../components/AuthContext';
import config from '../../../config';

function SendButton({ onSend, message, isMyMessage, inputRef, clearInput, sendButtonRef }) {

    function handleSend() {
        inputRef.current.focus();
        clearInput();

        message = message?.trim();

        const currentDate = new Date();
        const messageObj = { 'message': message || "", 'sendingDatetime': currentDate, 'isMyMessage': isMyMessage, 'isRead': true };
        onSend(messageObj);
    }


    const isNotValidInput = (/^[\s\n]+$/.test(message)) || (message === '' || message === undefined);

    return (
        <div ref={sendButtonRef} onClick={handleSend} className={`hover:bg-light-hover1 dark:hover:bg-dark-hover1 cursor-pointer rounded-full w-14 h-12 mx-1 flex justify-center items-center transition-all duration-200 ${(isNotValidInput) ? 'scale-0' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16">
                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
            </svg>
        </div>
    )
}

function EmojiButton({ onEmojiSelect }) {
    const [showPicker, setShowPicker] = useState(false);

    function handleEmojiSelect(emoji) {
        onEmojiSelect(emoji.native);
        setShowPicker(false);
    }

    const picker = <Picker data={emojiMartData} onEmojiSelect={handleEmojiSelect} />;


    return (
        <div>
            <div onClick={() => setShowPicker(!showPicker)} className="relative cursor-pointer hover:bg-light-hover1 dark:hover:bg-dark-hover1 rounded-full w-12 h-12 mx-1 flex justify-center items-center transition-color duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-emoji-smile" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5m4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5" />
                </svg>
            </div>

            {showPicker && (
                <div className="absolute bottom-16">
                    {picker}
                </div>
            )}
        </div>
    )
}

function AttachmentButton({ onFileSelect }) {
    const fileInputRef = useRef(null);

    const handleIconClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileSelect(file);
        }
        e.target.value = null;
    };

    return (
        <div>
            <div onClick={handleIconClick} className="relative cursor-pointer hover:bg-light-hover1 dark:hover:bg-dark-hover1 rounded-full w-12 h-12 mx-1 flex justify-center items-center transition-color duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                    <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
                </svg>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,video/*"
            />
        </div>
    );
}

function MessageInput({ input, onInput, inputRef, rows, setRows, isMobileScreen, sendButtonRef }) {

    useEffect(() => {
        if (inputRef) {
            const lines = Math.ceil(inputRef.current.scrollHeight / inputRef.current.clientHeight);

            inputRef.current.style.height = "auto";
            inputRef.current.style.height = inputRef.current.scrollHeight + 4 + "px";

            inputRef.current.scrollTop = inputRef.current.scrollHeight;

            // console.log(inputRef.current.clientHeight)
            setRows(lines);
        }
    }, [input, inputRef, setRows])

    function handleChange(event) {
        const inputValue = event.target.value;
        onInput(inputValue);
    }

    function handleKeyDown(event) {
        if (!isMobileScreen) {
            if (event.key === 'Enter' && event.ctrlKey) {
                event.preventDefault();

                const inputValue = input + "\n";
                onInput(inputValue);

                // const lines = inputValue.split('\n').length;
                // setRows(lines);
            }
            else if (event.key === 'Enter') {
                const isNotValidInput = (/^[\s\n]+$/.test(inputRef.current.value)) || (inputRef.current.value === '');

                event.preventDefault();
                if (!isNotValidInput) {
                    if (sendButtonRef) {
                        sendButtonRef.current.click();
                    }
                }
            }
        }
    }

    return (
        <textarea ref={inputRef} placeholder='Type a message' value={input} onInput={handleChange} onKeyDown={handleKeyDown} rows={1} className='w-full max-h-40 resize-none p-3 bg-light-primary dark:bg-dark-primary text-md focus:outline-none border-2 rounded-lg border-light-line dark:border-dark-line focus:border-light-focus dark:focus:border-dark-focus transition-colors duration-200' />
    )
}

function MediaPreview({ file, onCancel, onSend, uploading }) {
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-light-secondary dark:bg-dark-secondary border-t-2 border-light-line dark:border-dark-line w-full">
            {previewUrl ? (
                <img src={previewUrl} alt="preview" className="h-16 w-16 object-cover rounded-lg" />
            ) : (
                <div className="h-16 w-16 flex items-center justify-center bg-light-primary dark:bg-dark-primary rounded-lg text-xs text-center px-1 break-all">
                    {file.name}
                </div>
            )}
            <div className="flex-1 text-sm truncate">{file.name}</div>
            <button onClick={onCancel} className="text-red-400 hover:text-red-600 px-2 py-1 rounded transition-colors">✕</button>
            {uploading ? (
                <div className="w-10 h-10 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-light-focus dark:border-dark-focus"></div>
                </div>
            ) : (
                <button onClick={onSend} className="bg-light-focus dark:bg-dark-focus text-white rounded-full w-10 h-10 flex justify-center items-center hover:opacity-80 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16">
                        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
                    </svg>
                </button>
            )}
        </div>
    );
}

function MessageBox({ activeContactData, isMobileScreen, onSend, rows, setRows }) {
    const [inputs, setInputs] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const authContext = useContext(AuthContext);

    const sendButtonRef = useRef(null);
    const inputRef = useRef(null);

    let currentInput;
    currentInput = (activeContactData.username in inputs) ? (inputs[activeContactData.username]) : '';

    useEffect(() => {
        if (inputRef.current) {
            if (!isMobileScreen) {
                inputRef.current.focus();
            }
        }
    }, [activeContactData, isMobileScreen])

    useEffect(() => {
        setSelectedFile(null);
    }, [activeContactData])

    function handleInput(input) {
        const id = activeContactData.username;
        setInputs({ ...inputs, [id]: input });
    }

    function handleEmojiSelect(emoji) {
        const id = activeContactData.username;
        const newCurrentInput = currentInput + emoji;
        inputRef.current.focus();
        setInputs({ ...inputs, [id]: newCurrentInput });
    }

    function handleClearInput() {
        const id = activeContactData.username;
        setInputs({ ...inputs, [id]: '' });
        setRows(1);
    }

    function handleFileSelect(file) {
        setSelectedFile(file);
    }

    async function handleMediaSend() {
        if (!selectedFile) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('media', selectedFile);

        try {
            const response = await fetch(`${config.serverURL}/api/media/upload`, {
                method: 'POST',
                headers: { 'Authorization': authContext.token },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const messageObj = {
                    'message': '',
                    'sendingDatetime': new Date(),
                    'isMyMessage': true,
                    'isRead': true,
                    'mediaUrl': data.mediaUrl,
                    'mediaType': data.mediaType
                };
                onSend(messageObj);
                setSelectedFile(null);
            } else {
                console.error("Failed to upload media");
            }
        } catch (error) {
            console.error("Error uploading media:", error);
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className='flex flex-col bg-light-secondary dark:bg-dark-secondary border-t-2 border-light-line dark:border-dark-line'>

            {selectedFile && (
                <MediaPreview
                    file={selectedFile}
                    onCancel={() => setSelectedFile(null)}
                    onSend={handleMediaSend}
                    uploading={uploading}
                />
            )}

            {
                activeContactData.isUnfriend ? (
                    <div className="flex justify-center p-2 text-sm">You both need to be friends to send message</div>
                ) : (
                    <div className='flex flex-row items-end justify-center h-auto p-2 pl-0'>
                        <AttachmentButton onFileSelect={handleFileSelect} />
                        <EmojiButton onEmojiSelect={handleEmojiSelect} />
                        <MessageInput input={currentInput} onInput={handleInput} inputRef={inputRef} rows={rows} setRows={setRows} isMobileScreen={isMobileScreen} sendButtonRef={sendButtonRef} />
                        <SendButton onSend={onSend} message={currentInput} isMyMessage={true} inputRef={inputRef} clearInput={handleClearInput} sendButtonRef={sendButtonRef} />
                    </div>
                )
            }

        </div>
    )
}

export default MessageBox;