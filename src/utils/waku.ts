import { Direction, getBootstrapNodes, Waku, WakuMessage } from 'js-waku';
import { Message } from '../Message';
import { ChatMessage } from '../ChatMessage';

export async function initWaku(setter: (waku: Waku) => void) {
  try {
    const waku = await Waku.create({
      libp2p: {
        config: {
          pubsub: {
            enabled: true,
            emitSelf: true,
          },
        },
      },
      bootstrap: getBootstrapNodes.bind({}, selectFleetEnv()),
    });

    setter(waku);
  } catch (e) {
    console.log('Issue starting waku ', e);
  }
}

export async function retrieveStoreMessages(
  waku: Waku,
  topic: string,
  balanceMap: any,
  setArchivedMessages: (value: Message[]) => void
): Promise<number> {
  const callback = (wakuMessages: WakuMessage[]): void => {
    const messages: Message[] = [];
    wakuMessages
      .map((wakuMsg) => Message.fromWakuMessage(wakuMsg))
      .forEach((message) => {
        if (message) {
          if (message.address) {
            message.balance = balanceMap[message.address];
          }
          messages.push(message);
        }
      });
    setArchivedMessages(messages);
  };

  const startTime = new Date();
  // Only retrieve a week of history
  startTime.setTime(Date.now() - 1000 * 60 * 60 * 24 * 7);

  const endTime = new Date();

  try {
    const res = await waku.store.queryHistory([topic], {
      pageSize: 5,
      direction: Direction.FORWARD,
      timeFilter: {
        startTime,
        endTime,
      },
      callback,
    });

    return res.length;
  } catch (e) {
    console.log('Failed to retrieve messages', e);
    return 0;
  }
}

export async function sendMessage(
  waku: Waku,
  chatMessage: ChatMessage,
  chatTopic: string
) {
  const wakuMsg = await WakuMessage.fromBytes(chatMessage.encode(), chatTopic, {
    timestamp: new Date(),
  });
  return waku.relay.send(wakuMsg);
}

export function selectFleetEnv() {
  // Works with react-scripts
  if (process?.env?.NODE_ENV === 'development') {
    return ['fleets', 'wakuv2.test', 'waku-websocket'];
  } else {
    return ['fleets', 'wakuv2.prod', 'waku-websocket'];
  }
}

export function reduceMessages(state: Message[], newMessages: Message[]) {
  return state.concat(newMessages);
}
