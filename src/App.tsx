import { useEffect, useReducer, useState } from 'react';
import { Waku, WakuMessage } from 'js-waku';
import { useHash } from 'react-use';
import { generate } from 'server-name-generator';
import { ThemeProvider } from '@livechat/ui-kit';
import { Message } from './Message';
import handleCommand from './command';
import Room from './components/Room';
import { WakuContext } from './providers/WakuContext';
import { useWeb3Context } from './providers/Web3ContextProvider';
import { initWaku, retrieveStoreMessages, reduceMessages } from './utils/waku';
import './App.css';

const themes = {
  AuthorName: {
    css: {
      fontSize: '1.1em',
    },
  },
  Message: {
    css: {
      margin: '0em',
      padding: '0em',
      fontSize: '0.83em',
    },
  },
  MessageText: {
    css: {
      margin: '0em',
      padding: '0.1em',
      paddingLeft: '1em',
      fontSize: '1.1em',
    },
  },
  MessageGroup: {
    css: {
      margin: '0em',
      padding: '0.2em',
    },
  },
};

export default function App() {
  const [hash] = useHash();
  const { provider } = useWeb3Context();
  const [messages, dispatchMessages] = useReducer(reduceMessages, []);
  const [waku, setWaku] = useState<Waku | undefined>(undefined);
  const [nick, setNick] = useState<string>(() => {
    const persistedNick = window.localStorage.getItem('nick');
    return persistedNick !== null ? persistedNick : generate();
  });
  const [
    historicalMessagesRetrieved,
    setHistoricalMessagesRetrieved,
  ] = useState(false);
  const [poolId] = hash.slice(2).split('/');
  const chatTopic = `/pool-chat/${poolId}`;

  useEffect(() => {
    localStorage.setItem('nick', nick);
  }, [nick]);

  useEffect(() => {
    initWaku(setWaku)
      .then(() => console.log('Waku init done'))
      .catch((e) => console.log('Waku init failed ', e));
  }, []);

  useEffect(() => {
    if (!waku) return;
    // Let's retrieve previous messages before listening to new messages
    if (!historicalMessagesRetrieved) return;

    const handleRelayMessage = (wakuMsg: WakuMessage) => {
      console.log('Message received: ', wakuMsg);
      const msg = Message.fromWakuMessage(wakuMsg);
      if (msg) {
        dispatchMessages([msg]);
      }
    };

    waku.relay.addObserver(handleRelayMessage, [chatTopic]);

    return function cleanUp() {
      waku?.relay.deleteObserver(handleRelayMessage, [chatTopic]);
    };
  }, [waku, historicalMessagesRetrieved]);

  useEffect(() => {
    if (!waku) return;
    if (historicalMessagesRetrieved) return;

    const retrieveMessages = async () => {
      await waku.waitForConnectedPeer();
      console.log(`Retrieving archived messages}`);

      try {
        retrieveStoreMessages(waku, chatTopic, dispatchMessages).then(
          (length) => {
            console.log(`Messages retrieved:`, length);
            setHistoricalMessagesRetrieved(true);
          }
        );
      } catch (e) {
        console.log(`Error encountered when retrieving archived messages`, e);
      }
    };

    retrieveMessages();
  }, [waku, historicalMessagesRetrieved]);

  return (
    <div
      className="chat-app"
      style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}
    >
      <WakuContext.Provider value={{ waku, chatTopic }}>
        <ThemeProvider theme={themes}>
          <Room
            nick={nick}
            messages={messages}
            commandHandler={async (input: string) => {
              const { command, response } = await handleCommand(
                input,
                waku,
                provider,
                setNick
              );
              const commandMessages = response.map((msg) => {
                return Message.fromUtf8String(command, msg);
              });
              dispatchMessages(commandMessages);
            }}
          />
        </ThemeProvider>
      </WakuContext.Provider>
    </div>
  );
}
