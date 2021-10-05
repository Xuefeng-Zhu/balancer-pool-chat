import { WakuMessage } from 'js-waku';
import { ChatContentTopic } from './App';
import ChatList from './ChatList';
import MessageInput from './MessageInput';
import { useWaku } from './WakuContext';
import { TitleBar } from '@livechat/ui-kit';
import { Message } from './Message';
import { ChatMessage } from './chat_message';

interface Props {
  messages: Message[];
  commandHandler: (cmd: string) => void;
  nick: string;
}

export default function Room(props: Props) {
  const { waku } = useWaku();

  let relayPeers = 0;
  let storePeers = 0;
  if (waku) {
    relayPeers = waku.relay.getPeers().size;
    storePeers = waku.store.peers.length;
  }

  return (
    <div
      className="chat-container"
      style={{ height: '98vh', display: 'flex', flexDirection: 'column' }}
    >
      <TitleBar
        leftIcons={`Peers: ${relayPeers} relay, ${storePeers} store.`}
        title="Pool Chat"
      />
      <ChatList messages={props.messages} />
      <MessageInput
        sendMessage={
          waku
            ? async (messageToSend) => {
                return handleMessage(
                  messageToSend,
                  props.nick,
                  props.commandHandler,
                  waku.relay.send.bind(waku.relay)
                );
              }
            : undefined
        }
      />
    </div>
  );
}

async function handleMessage(
  message: string,
  nick: string,
  commandHandler: (cmd: string) => void,
  messageSender: (msg: WakuMessage) => Promise<void>
) {
  if (message.startsWith('/')) {
    commandHandler(message);
  } else {
    const timestamp = new Date();
    const chatMessage = ChatMessage.fromUtf8String(timestamp, nick, message);
    const wakuMsg = await WakuMessage.fromBytes(
      chatMessage.encode(),
      ChatContentTopic,
      { timestamp }
    );
    return messageSender(wakuMsg);
  }
}
