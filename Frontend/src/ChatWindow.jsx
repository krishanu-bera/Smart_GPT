import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import {ScaleLoader} from "react-spinners";

function ChatWindow() {
    const {prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat} = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");

    const canSend = prompt.trim() && !loading;

    const getReply = async () => {
        const trimmedPrompt = prompt.trim();

        if(!trimmedPrompt || loading) {
            return;
        }

        setLoading(true);
        setNewChat(false);
        setError("");

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: trimmedPrompt,
                threadId: currThreadId
            })
        };

        try {
            const response = await fetch("/api/chat", options);
            const res = await response.json();

            if(!response.ok) {
                throw new Error(res.error || "Unable to send your message right now.");
            }

            setReply(res.reply);
        } catch(err) {
            console.log(err);
            setError(err.message || "Unable to connect to the backend.");
        }
        setLoading(false);
    }

    //Append new chat to prevChats
    useEffect(() => {
        if(prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, {
                    role: "user",
                    content: prompt
                },{
                    role: "assistant",
                    content: reply
                }]
            ));
        }

        setPrompt("");
    }, [reply]);


    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div className="chatWindow">
            <div className="navbar">
                <div className="brandBlock">
                    <span className="brandTitle">SmartGPT</span>
                    <span className="brandSubtitle">AI chat workspace</span>
                </div>
                <button type="button" className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </button>
            </div>
            {
                isOpen && 
                <div className="dropDown">
                    <div className="dropDownItem"><i className="fa-solid fa-gear"></i> Settings</div>
                    <div className="dropDownItem"><i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan</div>
                    <div className="dropDownItem"><i className="fa-solid fa-arrow-right-from-bracket"></i> Log out</div>
                </div>
            }
            <Chat></Chat>

            <div className="loaderRow">
                <ScaleLoader color="rgba(248, 250, 252, 0.95)" loading={loading} height={24}></ScaleLoader>
            </div>
            
            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" ? getReply() : ""}
                        disabled={loading}
                    >
                           
                    </input>
                    <button type="button" id="submit" onClick={getReply} disabled={!canSend}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
                {error && <p className="errorMessage">{error}</p>}
                <p className="info">
                    SmartGPT can make mistakes. Double-check important information.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;
