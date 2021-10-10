import { WakuMessage } from 'js-waku';
import { ChatMessage } from './ChatMessage';

export class Message {
  public chatMessage: ChatMessage;
  // WakuMessage timestamp
  public sentTimestamp: Date | undefined;

  public balance: number;

  constructor(chatMessage: ChatMessage, sentTimestamp: Date | undefined) {
    this.chatMessage = chatMessage;
    this.sentTimestamp = sentTimestamp;
    this.balance = 0;
  }

  static fromWakuMessage(wakuMsg: WakuMessage): Message | undefined {
    if (wakuMsg.payload) {
      try {
        const chatMsg = ChatMessage.decode(wakuMsg.payload);
        if (chatMsg) {
          return new Message(chatMsg, wakuMsg.timestamp);
        }
      } catch (e) {
        console.error(
          'Failed to decode chat message',
          wakuMsg.payloadAsUtf8,
          e
        );
      }
    }
    return;
  }

  static fromUtf8String(nick: string, text: string, address: string): Message {
    const now = new Date();
    return new Message(ChatMessage.fromUtf8String(nick, text, address), now);
  }

  get nick() {
    return this.chatMessage.nick;
  }

  get timestamp() {
    return this.chatMessage.timestamp;
  }

  get payloadAsUtf8() {
    return this.chatMessage.payloadAsUtf8;
  }

  get zoraId() {
    return this.chatMessage.zoraId;
  }

  get nftContract() {
    return this.chatMessage.nftContract;
  }

  get livepeer() {
    return this.chatMessage.livepeer;
  }

  get address() {
    return this.chatMessage.address;
  }

  get authorName() {
    if (!this.address) {
      return this.nick;
    }

    return `${this.nick} (${this.address}, Balance: ${this.balance || 0})`;
  }
}
