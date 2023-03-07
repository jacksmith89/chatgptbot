import { useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  Conversation,
  ConversationList,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';

const API_KEY = "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";

// "system" -> generally one initial message defining how we want the chatbot to behave
const systemMessage = {
  role: "system",
  content: "I am a creative and descriptive writing assistant."
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: 'Hello, I am a bot',
      sentTime: "just now",
      sender: 'bot',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false); // [state, setState]

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: 'user',
    };

    const newMessages = [...messages, newMessage]; // all the old message, + the new message

    // update our messages state
    setMessages(newMessages);

    // set a typing indicator (chatbot is thinking)
    setIsTyping(true);
    // process message with bot
    await processMessageToChatbot(newMessages);
  };

  async function processMessageToChatbot(chatMessages) {
    // chatMessages { sender: "user" or "bot", message: "text" }
    // apiMessages { role: "user" or "assistant", content: "text" }

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "bot") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message }
    });

    // role: "user" -> a message from the user, "assistant" -> a message from the chatbot


    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages //[message1, message2, message3]
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      }).then((data) => {
        return data.json();
      }).then((data) => {
        console.log(data);
        setMessages([...chatMessages, {
          message: data.choices[0].message.content,
          sender: "bot"
        }]);
        setIsTyping(false);
      });
  }

  return (
    <div className="App">
      <div style={{ position: 'relative', height: '800px', width: '700px' }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior='smooth'
              typingIndicator={isTyping ? <TypingIndicator content="Chatbot is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput placeholder="Type message here..." onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;