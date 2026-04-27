import ProfilePicture from "../components/common/ProfilePicture";
import ContactName from "../components/common/ContactName";
import { useRef } from "react";
import { CSSTransition } from "react-transition-group";
import { getDatetimeWordWithDay } from "../../../utils/helpers";
import SentIcon from "../components/common/SentIcon";
import DeliveredIcon from "../components/common/DeliveredIcon";
import ReadIcon from "../components/common/ReadIcon";
import SendingIcon from "../components/common/SendingIcon";

function UnreadMsgBadge({ unreadMsgCount, isActive }) {
    const badgeRef = useRef(null);

    return (
        <CSSTransition
            in={unreadMsgCount > 0 && !isActive}
            unmountOnExit
            timeout={100}
            classNames="unread-badge"
            nodeRef={badgeRef}
        >
            <div ref={badgeRef} className="ml-auto mt-2 w-5 h-5 flex justify-center items-center text-center rounded-full text-white bg-light-button2Normal dark:bg-dark-button2Normal">
                {(unreadMsgCount < 10) ? (unreadMsgCount > 0) ? (unreadMsgCount) : '' : ('9+')}
            </div>

        </CSSTransition>
    )
}

function ContactCard({ hasNewMessages, name, username, pfp, lastMsg, unreadMsgCount, onContactClick, id, onActive, isActive, about, isOnline, lastSeen, isUnfriend }) {

    const cardRef = useRef(null);

    function handleContactClick() {
        onActive(id);
        onContactClick({ id: id, name: name, username: username, pfp: pfp, about: about, isOnline, lastSeen, isUnfriend });
    }


    return (
        <CSSTransition
            in={hasNewMessages}
            timeout={100}
            classNames="contact-card"
            nodeRef={cardRef}
        >

            <div ref={cardRef} onClick={handleContactClick} className={`flex flex-row cursor-pointer border-b-2 border-light-line dark:border-dark-line p-4 ${(isActive) ? 'bg-light-active dark:bg-dark-active' : 'hover:bg-light-hover2 dark:hover:bg-dark-hover2'}`}>
                <div>
                    <ProfilePicture img={pfp} />
                </div>

                <div className="flex flex-col ml-3 w-2/5">
                    <ContactName name={username} />
                    <div className="flex items-center font-thin text-sm">
                        <div className="mr-1">
                            {
                                lastMsg.isMyMessage && !lastMsg.isConnectionMsg && !lastMsg.isReconnectionMsg ?
                                    <div className="ml-1">
                                        {
                                            lastMsg.status === 'sent' ? <SentIcon />
                                                : lastMsg.status === 'delivered' ? <DeliveredIcon />
                                                    : lastMsg.status === 'read' ? <ReadIcon />
                                                        : <SendingIcon />
                                        }

                                    </div>
                                    : ''
                            }
                        </div>
                        <p className="opacity-80 w-full truncate whitespace-nowrap whitespace-pre">
                            {lastMsg
                                ? lastMsg.mediaType === 'image' ? '📷 Photo'
                                    : lastMsg.mediaType === 'video' ? '🎥 Video'
                                    : lastMsg.mediaType === 'document' ? '📄 Document'
                                    : (lastMsg.message).split('\n').join(' ')
                                : 'Loading...'}
                        </p>

                    </div>
                </div>

                <div className="ml-auto text-xs flex flex-col">
                    <p className="opacity-80">{getDatetimeWordWithDay(lastMsg.sendingDatetime)}</p>

                    <UnreadMsgBadge unreadMsgCount={unreadMsgCount} isActive={isActive} />
                </div>
            </div>

        </CSSTransition>
    )
}

export default ContactCard;