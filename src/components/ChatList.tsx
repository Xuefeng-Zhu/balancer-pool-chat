import { memo, useEffect, useRef, useState, useCallback } from 'react';
import {
  Message as LiveMessage,
  MessageText,
  MessageList,
} from '@livechat/ui-kit';
import { NFTPreview } from '@zoralabs/nft-components';
import videojs from 'video.js';
import 'videojs-contrib-hls';
import 'video.js/dist/video-js.min.css';

import { Message } from '../Message';

interface Props {
  messages: Message[];
}

memo(ChatList);

function ChatMessage({ message }: { message: Message }) {
  const [videoEl, setVideoEl] = useState<string>('');
  const onVideo = useCallback((el) => {
    setVideoEl(el);
  }, []);

  useEffect(() => {
    if (!videoEl) return;

    videojs(videoEl, {
      autoplay: true,
      controls: true,
      sources: [
        {
          src: `https://cdn.livepeer.com/hls/${message.livepeer}/index.m3u8`,
        },
      ],
    });

    // player.hlsQualitySelector();

    // player.on('error', () => {
    //   player.src(`https://cdn.livepeer.com/hls/${message.livepeer}/index.m3u8`);
    // });
  }, [videoEl, message.livepeer]);

  if (message.livepeer) {
    return (
      <div data-vjs-player>
        <video
          id="video"
          ref={onVideo}
          className="h-full w-full video-js vjs-theme-city"
          controls
          playsInline
        />
      </div>
    );
  }

  if (message.zoraId) {
    return (
      <NFTPreview
        id={message.zoraId}
        contract={message.nftContract}
        showBids={false}
      />
    );
  }

  return <MessageText>{message.payloadAsUtf8}</MessageText>;
}

export default function ChatList(props: Props) {
  const renderedMessages = props.messages.map((message) => (
    <LiveMessage
      key={
        message.sentTimestamp
          ? message.sentTimestamp.valueOf()
          : '' +
            message.timestamp.valueOf() +
            message.nick +
            message.payloadAsUtf8
      }
      authorName={message.authorName}
      date={formatDisplayDate(message)}
    >
      <ChatMessage message={message} />
    </LiveMessage>
  ));

  return (
    <MessageList active containScrollInSubtree>
      {renderedMessages}
      <AlwaysScrollToBottom messages={props.messages} />
    </MessageList>
  );
}

function formatDisplayDate(message: Message): string {
  return message.timestamp.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
}

const AlwaysScrollToBottom = (props: { messages: Message[] }) => {
  const elementRef = useRef<HTMLDivElement>();

  useEffect(() => {
    // @ts-ignore
    elementRef.current.scrollIntoView();
  }, [props.messages]);

  // @ts-ignore
  return <div ref={elementRef} />;
};
