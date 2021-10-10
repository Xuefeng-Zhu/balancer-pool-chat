/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "";

export interface ChatMessage {
  timestamp: number;
  nick: string;
  payload: Uint8Array;
  zoraId: string;
}

const baseChatMessage: object = { timestamp: 0, nick: "", zoraId: "" };

export const ChatMessage = {
  encode(
    message: ChatMessage,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.timestamp !== 0) {
      writer.uint32(8).uint64(message.timestamp);
    }
    if (message.nick !== "") {
      writer.uint32(18).string(message.nick);
    }
    if (message.payload.length !== 0) {
      writer.uint32(26).bytes(message.payload);
    }
    if (message.zoraId !== "") {
      writer.uint32(34).string(message.zoraId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ChatMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseChatMessage } as ChatMessage;
    message.payload = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timestamp = longToNumber(reader.uint64() as Long);
          break;
        case 2:
          message.nick = reader.string();
          break;
        case 3:
          message.payload = reader.bytes();
          break;
        case 4:
          message.zoraId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ChatMessage {
    const message = { ...baseChatMessage } as ChatMessage;
    message.payload = new Uint8Array();
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = Number(object.timestamp);
    } else {
      message.timestamp = 0;
    }
    if (object.nick !== undefined && object.nick !== null) {
      message.nick = String(object.nick);
    } else {
      message.nick = "";
    }
    if (object.payload !== undefined && object.payload !== null) {
      message.payload = bytesFromBase64(object.payload);
    }
    if (object.zoraId !== undefined && object.zoraId !== null) {
      message.zoraId = String(object.zoraId);
    } else {
      message.zoraId = "";
    }
    return message;
  },

  toJSON(message: ChatMessage): unknown {
    const obj: any = {};
    message.timestamp !== undefined && (obj.timestamp = message.timestamp);
    message.nick !== undefined && (obj.nick = message.nick);
    message.payload !== undefined &&
      (obj.payload = base64FromBytes(
        message.payload !== undefined ? message.payload : new Uint8Array()
      ));
    message.zoraId !== undefined && (obj.zoraId = message.zoraId);
    return obj;
  },

  fromPartial(object: DeepPartial<ChatMessage>): ChatMessage {
    const message = { ...baseChatMessage } as ChatMessage;
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = object.timestamp;
    } else {
      message.timestamp = 0;
    }
    if (object.nick !== undefined && object.nick !== null) {
      message.nick = object.nick;
    } else {
      message.nick = "";
    }
    if (object.payload !== undefined && object.payload !== null) {
      message.payload = object.payload;
    } else {
      message.payload = new Uint8Array();
    }
    if (object.zoraId !== undefined && object.zoraId !== null) {
      message.zoraId = object.zoraId;
    } else {
      message.zoraId = "";
    }
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw "Unable to locate global object";
})();

const atob: (b64: string) => string =
  globalThis.atob ||
  ((b64) => globalThis.Buffer.from(b64, "base64").toString("binary"));
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

const btoa: (bin: string) => string =
  globalThis.btoa ||
  ((bin) => globalThis.Buffer.from(bin, "binary").toString("base64"));
function base64FromBytes(arr: Uint8Array): string {
  const bin: string[] = [];
  for (const byte of arr) {
    bin.push(String.fromCharCode(byte));
  }
  return btoa(bin.join(""));
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
