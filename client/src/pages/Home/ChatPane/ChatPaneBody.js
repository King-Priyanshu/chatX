import { useContext, useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import ConnectionMessageBubble from "./ConnectionMessageBubble";
import DateBubble from "./DateBubble";
import { socket } from "../../../sio";

import config from "../../../config";
import InfiniteScroll from 'react-infinite-scroll-component';
import { AuthContext } from "../../../components/AuthContext";
import Spinner from "../../../components/common/Spinner";


function ChatPaneBody({ activeChatData, activeContactData, setChatData, MessageBoxRows, messageSent, isChatActive, chatData, isNewMessage, setIsNewMessage, contactData, setContactData, messageTransferredRef }) {
    const chatBodyRef = useRef(null);

    const {token} = useContext(AuthContext);

    const activeChatDataRef = useRef(null);

    const [chatItems, setChatItems] = useState([]);

    const [hasMoreMessages, setHasMoreMessages] = useState(true);

    const newMessagesFetchedRef = useRef(false);


    let messagePageIndex = 0;
    if(activeContactData.id){
        messagePageIndex = contactData.find(contact=>contact.id===activeContactData.id).messagePageIndex;
    }

    useEffect(()=>{
        // setMessagePageIndex(0);
        if(activeChatDataRef.current){
            const connectionMessage = Object.values(activeChatDataRef.current).find(message=>message.isConnectionMsg===true);
            setHasMoreMessages(connectionMessage?false:true);
        }
    }, [activeContactData.id, activeChatDataRef.current]);


    async function fetchMoreMessages(){
        try{
            const response = await fetch(config.serverURL + `/api/getmessagesbyfriendid?friendId=${activeContactData.id}&pageIndex=${messagePageIndex}`, {
                method: 'get',
                headers: {
                    'Authorization': token
                }
            })
    
            const data = await response.json();
            
            if(data.messages.length<data.pageSize){
                setHasMoreMessages(false);
            }

            if (response.ok) {

                let messagesData = {...chatData};
                data.messages.forEach(message => {
    
                    let latestMessageId = 0;
                    if (messagesData[message.isMyMessage ? message.receiver : message.sender]) {
                        const messageIds = Object.keys(messagesData[message.isMyMessage ? message.receiver : message.sender]);
                        latestMessageId = messageIds[messageIds.length-1]
                    }
                    const messageID = parseInt(latestMessageId) + 1;
    
    
                    messagesData = {
                        ...messagesData,
                        [message.isMyMessage ? message.receiver : message.sender]: {
                            ...messagesData[message.isMyMessage ? message.receiver : message.sender],
                            [messageID]:
                            {
                                'messageId': message._id,
                                message: message.message,
    
                                sendingDatetime: new Date(message.sendingDatetime),
                                sentDatetime: new Date(message.sentDatetime),
                                deliveredDatetime: new Date(message.deliveredDatetime),
                                readDatetime: new Date(message.readDatetime),
    
                                isMyMessage: message.isMyMessage,
                                status: message.status,
                                isRead: message.status==='read'?true:false,
                                isConnectionMsg: message.isConnectionMsg,
                                isReconnectionMsg: message.isReconnectionMsg,
                                mediaUrl: message.mediaUrl,
                                mediaType: message.mediaType
                            }
                        }
                    };
    
                });
    
                setContactData((prevContactData)=>{
                    const oldContact = {...prevContactData.find(contact=>contact.id===activeContactData.id)};
                    const updatedContact = {
                        ...oldContact,
                        messagePageIndex: oldContact.messagePageIndex+1
                    }
                    const oldContactData = [...prevContactData].filter(contact=>contact.id!=activeContactData.id);
                    return [
                        ...oldContactData,
                        updatedContact
                    ]
                })
    

                newMessagesFetchedRef.current = true;
                setChatData(messagesData);
            }
        }
        catch(e){
            // console.log('error')
        }
    }



    useEffect(() => {
        activeChatDataRef.current = chatData[activeContactData.id];
    }, [chatData, isChatActive, activeContactData.id]);

    useEffect(() => {
        const ele = chatBodyRef.current;

        if (ele) {
            if(newMessagesFetchedRef.current===true){
                // console.log(ele.scrollHeight);
                newMessagesFetchedRef.current = false;
                ele.scrollTop = ele.scrollTop + 20;
            }
            else if(messageTransferredRef.current===true){
                messageTransferredRef.current = false;
                ele.scrollTop = ele.scrollHeight;
            }
        }
    }, [activeChatDataRef.current, MessageBoxRows]);

    useEffect(()=>{
        const ele = chatBodyRef.current;
        if(ele){
            ele.scrollTop = ele.scrollHeight;
        }
    }, [isChatActive, activeContactData.id])

    useEffect(() => {
        function groupByDate(data) {
            const groupedData = {};
            data.forEach(([id, message]) => {

                // console.log(message)
                let strDatetime = `${message.sendingDatetime.getFullYear()}/${message.sendingDatetime.getMonth() + 1}/${message.sendingDatetime.getDate()}`

                const key = strDatetime.split('T')[0];
                if (!groupedData[key]) {
                    groupedData[key] = [];
                }

                groupedData[key].push({ ...message, id });
            });

            return groupedData;
        }

        if (activeChatDataRef.current && isChatActive) {
            const sortedActiveChatData = Object.entries(activeChatDataRef.current).sort((a, b) => a[1].sendingDatetime.getTime() - b[1].sendingDatetime.getTime());
            // console.log(sortedActiveChatData)
            const groupByDateChatData = groupByDate(sortedActiveChatData);



            const chatElements = Object.entries(groupByDateChatData).map(([date, messages]) => {

                return messages.map((message, index) => {

                    return <li key={`${message.id}`}>

                        {(!message.isConnectionMsg && !message.isReconnectionMsg) ?
                            <>
                                <DateBubble date={date} isFirstMsg={index === 0 && !messages[0].isConnectionMsg} />
                                <MessageBubble messageText={message.message} messageDatetime={{ sendingDatetime: message.sendingDatetime, sentDatetime: message.sentDatetime, deliveredDatetime: message.deliveredDatetime, readDatetime: message.readDatetime }} isMyMessage={message.isMyMessage} isLastMessage={message.id === (Object.keys(activeChatDataRef.current)[Object.keys(activeChatDataRef.current).length - 1])} messageSent={messageSent} status={message.status} mediaUrl={message.mediaUrl} mediaType={message.mediaType} />
                            </>
                            :
                            <>
                            <DateBubble date={date} isFirstMsg={index === 0 && !messages[0].isConnectionMsg} />
                            <ConnectionMessageBubble message={message} />
                            </>
                        }
                    </li>

                })

            })
            // console.log('hi')

            setChatItems(chatElements);
        }
    }, [activeContactData, isChatActive, activeChatDataRef.current, chatData]);

    useEffect(() => {
        if (isChatActive) {
            socket.emit('readMessage', {
                sender: activeContactData.id,
                readDatetime: new Date()
            });


        }
    }, [isChatActive, activeContactData, activeChatDataRef.current ? Object.keys(activeChatDataRef.current).length : undefined, isNewMessage]);



    return (
        <div id="messagesDiv" className='flex flex-1 flex-col-reverse h-full flex-col p-2 overflow-y-auto' ref={chatBodyRef}>

            <InfiniteScroll
                dataLength={(activeChatDataRef && isChatActive)?Object.keys(activeChatDataRef.current).length:0}
                next={fetchMoreMessages}
                style={{display: 'flex', flexDirection: 'column-reverse', overflow: 'hidden'}}
                inverse={true}
                hasMore={hasMoreMessages}
                loader={<div className="mb-4"><Spinner /></div>}
                scrollableTarget={'messagesDiv'}
            >
                {/* change hasMoreMessages to an object with contact.id as key */}
                <ul className="overflow-y-hidden">
                    {chatItems}
                </ul>
            </InfiniteScroll>

        </div>
    )
}

export default ChatPaneBody;