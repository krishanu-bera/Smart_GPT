import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const {newChat, prevChats, reply} = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if(reply === null) {
            setLatestReply(null); //prevchat load
            return;
        }

        if(!prevChats?.length) return;

        const content = reply.split(" "); //individual words

        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx+1).join(" "));

            idx++;
            if(idx >= content.length) clearInterval(interval);
        }, 40);

        return () => clearInterval(interval);

    }, [prevChats, reply])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prevChats, latestReply, newChat]);

    const historicalChats = prevChats.slice(0, -1);

    return (
        <div className="chatShell">
            {newChat && (
                <div className="emptyState">
                    <span className="emptyStateBadge">SmartGPT</span>
                    <h1>Start a new chat</h1>
                    <p>Ask a question, request code, or continue one of your saved threads from the sidebar.</p>
                </div>
            )}
            <div className="chats">
                {
                    historicalChats?.map((chat, idx) => 
                        <div className={chat.role === "user"? "userDiv" : "gptDiv"} key={`${chat.role}-${idx}`}>
                            {
                                chat.role === "user"? 
                                <p className="userMessage">{chat.content}</p> : (
                                    <div className="assistantMessage">
                                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
                                    </div>
                                )
                            }
                        </div>
                    )
                }

                {
                    prevChats.length > 0  && (
                        <>
                            {
                                latestReply === null ? (
                                    <div className="gptDiv" key={"non-typing"} >
                                        <div className="assistantMessage">
                                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{prevChats[prevChats.length-1].content}</ReactMarkdown>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="gptDiv" key={"typing"} >
                                        <div className="assistantMessage typingMessage">
                                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{latestReply}</ReactMarkdown>
                                        </div>
                                    </div>
                                )

                            }
                        </>
                    )
                }
                <div ref={chatEndRef}></div>
            </div>
        </div>
    )
}

export default Chat;
