import { useState, useEffect, useRef } from "react";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";

export default function ChatBox({ auctionId, user }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        console.log("useEffect triggered with auctionId:", auctionId);
        const channel = window.Echo.channel(`auction.${auctionId}.chat`);

        channel.listen("NewMessage", (e) => {
            console.log("Received new message:", e);
            setMessages((prev) => {
                return [...prev, e.message];
            });
        });

        channel.subscribed(() => {
            console.log("Successfully subscribed to channel");
        });

        axios.get(route("chat.messages", auctionId)).then((response) => {
            setMessages(response.data);
        });

        return () => {
            channel.stopListening("NewMessage");
            window.Echo.leave(`auction.${auctionId}.chat`);
        };
    }, [auctionId]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsLoading(true);
        axios
            .post(route("chat.send"), {
                auction_id: auctionId,
                message: message.trim(),
            })
            .then(() => {
                setMessage("");
            })
            .catch((error) => {
                console.error("Error sending message:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="flex flex-col h-[400px] bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                    Live Chat
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            msg.user_id === user.id
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                                msg.user_id === user.id
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            <p className="text-sm font-semibold">
                                {msg.user.name}
                            </p>
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs opacity-75 mt-1">
                                {new Date(msg.created_at).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form
                onSubmit={sendMessage}
                className="p-4 border-t border-gray-200"
            >
                <div className="flex gap-2">
                    <TextInput
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <PrimaryButton
                        type="submit"
                        disabled={isLoading || !message.trim()}
                    >
                        Send
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
