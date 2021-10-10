import axios from 'axios';
import _ from 'lodash';
import { Waku } from 'js-waku';

import { sendMessage } from './waku';
import { ChatMessage } from '../ChatMessage';

const apiKey = '10519dad-ccaf-401e-b46a-b567405db6e7';

export async function searchNft(
  waku: Waku | undefined,
  nick: string,
  chatTopic: string,
  query: string | undefined
): Promise<string[]> {
  if (!waku) {
    return ['Waku node is starting'];
  }

  if (!query) {
    return ['Please enter query text'];
  }

  const res = await axios.get(
    `https://api.nftport.xyz/v0/search?chain=ethereum&text=${query}`,
    {
      headers: {
        Authorization: apiKey,
      },
    }
  );

  const { data }: any = res;
  const searchResults = data.search_results;
  const selectedResult = searchResults[_.random(searchResults.length)];

  const chatMessage = ChatMessage.fromZora(
    nick,
    selectedResult.token_id,
    selectedResult.contract_address
  );
  sendMessage(waku, chatMessage, chatTopic);

  return [];
}
