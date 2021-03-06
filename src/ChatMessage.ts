import { Reader } from 'protobufjs/minimal';

import * as proto from './proto/chat_message';

/**
 * ChatMessage is used by the various show case waku apps that demonstrates
 * waku used as the network layer for chat group applications.
 *
 * This is included to help building PoC and MVPs. Apps that aim to be
 * production ready should use a more appropriate data structure.
 */
export class ChatMessage {
  public constructor(public proto: proto.ChatMessage) {}

  /**
   * Create Chat Message with a utf-8 string as payload.
   */
  static fromUtf8String(
    nick: string,
    text: string,
    address: string = ''
  ): ChatMessage {
    const timestampNumber = Math.floor(new Date().valueOf() / 1000);
    const payload = Buffer.from(text, 'utf-8');

    return new ChatMessage({
      timestamp: timestampNumber,
      nick,
      payload,
      address,
      zoraId: '',
      nftContract: '',
      livepeer: '',
    });
  }

  static fromZora(
    nick: string,
    zoraId: string,
    address: string = '',
    nftContract = ''
  ): ChatMessage {
    const timestampNumber = Math.floor(new Date().valueOf() / 1000);
    const payload = Buffer.from('', 'utf-8');

    return new ChatMessage({
      timestamp: timestampNumber,
      nick,
      payload,
      address,
      zoraId,
      nftContract,
      livepeer: '',
    });
  }

  static fromLivepeer(
    nick: string,
    streamId: string,
    address: string = ''
  ): ChatMessage {
    const timestampNumber = Math.floor(new Date().valueOf() / 1000);
    const payload = Buffer.from('', 'utf-8');

    return new ChatMessage({
      timestamp: timestampNumber,
      nick,
      payload,
      address,
      zoraId: '',
      nftContract: '',
      livepeer: streamId,
    });
  }

  /**
   * Decode a protobuf payload to a ChatMessage.
   * @param bytes The payload to decode.
   */
  static decode(bytes: Uint8Array): ChatMessage {
    const protoMsg = proto.ChatMessage.decode(Reader.create(bytes));
    return new ChatMessage(protoMsg);
  }

  /**
   * Encode this ChatMessage to a byte array, to be used as a protobuf payload.
   * @returns The encoded payload.
   */
  encode(): Uint8Array {
    return proto.ChatMessage.encode(this.proto).finish();
  }

  get timestamp(): Date {
    return new Date(this.proto.timestamp * 1000);
  }

  get nick(): string {
    return this.proto.nick;
  }

  get zoraId(): string {
    return this.proto.zoraId;
  }

  get nftContract(): string {
    return this.proto.nftContract;
  }

  get livepeer(): string {
    return this.proto.livepeer;
  }

  get address(): string {
    return this.proto.address;
  }

  get payloadAsUtf8(): string {
    if (!this.proto.payload) {
      return '';
    }

    return Buffer.from(this.proto.payload).toString('utf-8');
  }
}
