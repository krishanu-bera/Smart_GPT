import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import {v1 as uuidv1} from "uuid";
import krishanuLogo from "./assets/krishanu-logo.png";

function Sidebar() {
    const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats} = useContext(MyContext);

    const getAllThreads = async () => {
        try {
            const response = await fetch("/api/thread");
            const res = await response.json();
            const filteredData = res.map(thread => ({threadId: thread.threadId, title: thread.title}));
            setAllThreads(filteredData);
        } catch(err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId])


    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    }

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);

        try {
            const response = await fetch(`/api/thread/${newThreadId}`);
            const res = await response.json();
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch(err) {
            console.log(err);
        }
    }   

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`/api/thread/${threadId}`, {method: "DELETE"});
            const res = await response.json();
            console.log(res);

            //updated threads re-render
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if(threadId === currThreadId) {
                createNewChat();
            }

        } catch(err) {
            console.log(err);
        }
    }

    return (
        <section className="sidebar">
            <button type="button" className="newChatButton" onClick={createNewChat}>
                <div className="newChatButtonContent">
                    <img src={krishanuLogo} alt="Krishanu logo" className="logo"></img>
                    <div className="newChatText">
                        <strong>New chat</strong>
                        <span>Start a fresh thread</span>
                    </div>
                </div>
                <span className="newChatIcon"><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            <div className="historyPanel">
                <div className="historyHeader">
                    <span>Recent chats</span>
                    <span>{allThreads.length}</span>
                </div>

                <ul className="history">
                    {
                        allThreads?.length ? allThreads.map((thread) => (
                            <li key={thread.threadId} 
                                onClick={() => changeThread(thread.threadId)}
                                className={thread.threadId === currThreadId ? "highlighted": ""}
                                title={thread.title}
                            >
                                <span className="threadTitle">{thread.title}</span>
                                <button
                                    type="button"
                                    className="deleteThreadButton"
                                    aria-label={`Delete ${thread.title}`}
                                    onClick={(e) => {
                                        e.stopPropagation(); //stop event bubbling
                                        deleteThread(thread.threadId);
                                    }}
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </li>
                        )) : (
                            <li className="emptyHistory">Your saved conversations will appear here.</li>
                        )
                    }
                </ul>
            </div>

            <div className="sign">
                <p>Built by Krishanu</p>
                <span>SmartGPT remembers your threads on the left.</span>
            </div>
        </section>
    )
}

export default Sidebar;
