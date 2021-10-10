import { WakuMessage } from 'js-waku';
import { Button } from 'antd';
import ChatList from './ChatList';
import MessageInput from './MessageInput';
import { useWaku } from '../providers/WakuContext';
import { TitleBar } from '@livechat/ui-kit';
import { Message } from '../Message';
import { ChatMessage } from '../ChatMessage';
import { useWeb3Context } from '../providers/Web3ContextProvider';

interface Props {
  messages: Message[];
  commandHandler: (cmd: string) => void;
  nick: string;
}

export default function Room(props: Props) {
  const { waku, chatTopic } = useWaku();
  const { web3Modal, loadWeb3Modal, logoutOfWeb3Modal } = useWeb3Context();
  const { nick, commandHandler } = props;

  async function handleMessage(message: string) {
    if (!waku) {
      return;
    }

    if (message.startsWith('/')) {
      commandHandler(message);
    } else {
      const timestamp = new Date();
      const chatMessage = ChatMessage.fromUtf8String(timestamp, nick, message);
      const wakuMsg = await WakuMessage.fromBytes(
        chatMessage.encode(),
        chatTopic,
        {
          timestamp,
        }
      );
      return waku.relay.send(wakuMsg);
    }
  }

  let rightIcon = (
    <Button shape="round" size="large" onClick={loadWeb3Modal}>
      Connect to wallet
    </Button>
  );

  if (web3Modal && web3Modal.cachedProvider) {
    rightIcon = (
      <Button shape="round" size="large" onClick={logoutOfWeb3Modal}>
        Logout
      </Button>
    );
  }

  return (
    <div
      className="chat-container"
      style={{ height: '98vh', display: 'flex', flexDirection: 'column' }}
    >
      <TitleBar rightIcons={rightIcon} title="Pool Chat" />
      <ChatList messages={props.messages} />
      <MessageInput sendMessage={handleMessage} />
    </div>
  );
}
