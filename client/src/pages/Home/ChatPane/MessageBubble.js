import SentIcon from "../components/common/SentIcon";
import SendingIcon from "../components/common/SendingIcon";
import ReadIcon from "../components/common/ReadIcon";
import { useEffect, useState } from "react";
import { socket } from "../../../sio";
import DeliveredIcon from "../components/common/DeliveredIcon";

function MessageBubble({ messageText, messageDatetime, isMyMessage, isLastMessage, status, mediaUrl, mediaType }) {

    let hours;
    let minutes;

    if(isMyMessage){
        hours = messageDatetime.sendingDatetime.getHours();
        minutes = messageDatetime.sendingDatetime.getMinutes();
    }
    else{
        hours = messageDatetime.sentDatetime.getHours();
        minutes = messageDatetime.sentDatetime.getMinutes();
    }

    const hoursString = (hours % 12 < 10 && hours % 12 !== 0) ? (`0${hours % 12}`) : ((hours % 12 === 0) ? (`12`) : (`${hours % 12}`));
    const minutesString = (minutes < 10) ? (`0${minutes}`) : (`${minutes}`);
    const messageTime = `${hoursString}:${minutesString} ${(hours < 12 || hours === 24) ? ('AM') : ('PM')}`;

    return (
        <div className="text-white p-1 flex">

            <div className={`${(isMyMessage) ? ('ml-auto bg-light-myMessage dark:bg-dark-myMessage') : ('bg-light-yourMessage text-black dark:text-white dark:bg-dark-yourMessage')} ${(isLastMessage) ? ('rounded-tr-xl') : ('rounded-r-xl')} p-2 inline-flex flex-col rounded-l-xl border max-w-[70%] break-words`}>

                {mediaUrl && (
                    <div className="mb-2">
                        {mediaType === 'image' && (
                            <img src={mediaUrl} alt="message-media" className="max-w-full rounded-lg h-auto max-h-64 object-cover" />
                        )}
                        {mediaType === 'video' && (
                            <video src={mediaUrl} controls className="max-w-full rounded-lg h-auto max-h-64" />
                        )}
                        {mediaType !== 'image' && mediaType !== 'video' && (
                            <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-300">
                                View Attachment
                            </a>
                        )}
                    </div>
                )}
                {messageText && (
                    <div className="whitespace-pre-wrap text-sm">
                        {messageText}
                    </div>
                )}

                <div className="text-xs ml-auto flex items-center">
                    <div>
                        {messageTime}
                    </div>
                    {
                        isMyMessage ?
                            <div className="ml-1">
                                {
                                    status === 'sent' ? <SentIcon />
                                        : status ==='delivered' ? <DeliveredIcon />
                                        : status === 'read' ? <ReadIcon />
                                            : <SendingIcon />
                                }

                            </div>
                            : ''
                    }

                </div>

            </div>

        </div>
    )
}

export default MessageBubble;