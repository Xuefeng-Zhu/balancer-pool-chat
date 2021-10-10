// @ts-nocheck

import { useEffect, useReducer, useState } from 'react';
import { Waku, WakuMessage } from 'js-waku';
import { useHash } from 'react-use';
import { generate } from 'server-name-generator';
import { ThemeProvider } from '@livechat/ui-kit';
import { useQuery, gql } from '@apollo/client';

import { Message } from './Message';
import handleCommand from './command';
import Room from './components/Room';
import PoolList from './components/PoolList';
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

const POOL_GQL = gql(`
  query Pool($poolId: String!) {
    pools(first: 1, where: {id: $poolId}) {
      id
      shares {
        userAddress {
          id
        }
        balance
      }
    }
  }
`);

function getBalanceMap(poolData: any) {
  const result: any = {};
  if (!poolData || !poolData.pools[0]) {
    return result;
  }

  poolData.pools[0].shares.forEach((share: any) => {
    result[share.userAddress.id] = parseInt(share.balance);
  });
  return result;
}

export default function App() {
  const [hash] = useHash();
  const { provider, address } = useWeb3Context();
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
  const { loading: poolLoading, data: poolData } = useQuery(POOL_GQL, {
    pollInterval: 2500,
    variables: { poolId },
  });
  const balanceMap = getBalanceMap(poolData);

  console.log(poolLoading, poolData);
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
        if (msg.address) {
          msg.balance = balanceMap[msg.address];
        }
        dispatchMessages([msg]);
      }
    };

    waku.relay.addObserver(handleRelayMessage, [chatTopic]);

    return function cleanUp() {
      waku?.relay.deleteObserver(handleRelayMessage, [chatTopic]);
    };
  }, [waku, historicalMessagesRetrieved, chatTopic]);

  useEffect(() => {
    if (!waku) return;
    if (historicalMessagesRetrieved) return;

    const retrieveMessages = async () => {
      await waku.waitForConnectedPeer();
      console.log(`Retrieving archived messages}`);

      try {
        retrieveStoreMessages(
          waku,
          chatTopic,
          balanceMap,
          dispatchMessages
        ).then((length) => {
          console.log(`Messages retrieved:`, length);
          setHistoricalMessagesRetrieved(true);
        });
      } catch (e) {
        console.log(`Error encountered when retrieving archived messages`, e);
      }
    };

    retrieveMessages();
  }, [waku, historicalMessagesRetrieved, chatTopic]);

  if (!poolId) {
    return <PoolList />;
  }

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
                address,
                nick,
                chatTopic,
                setNick
              );
              const commandMessages = response.map((msg) => {
                const message = Message.fromUtf8String(command, msg, address);
                if (message.address) {
                  message.balance = balanceMap[message.address];
                }
                return message;
              });
              dispatchMessages(commandMessages);
            }}
          />
        </ThemeProvider>
      </WakuContext.Provider>
    </div>
  );
}
