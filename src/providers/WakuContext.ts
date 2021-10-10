import { createContext, useContext } from 'react';
import { Waku } from 'js-waku';

export type WakuContextType = {
  waku?: Waku;
  chatTopic: string;
};

export const WakuContext = createContext<WakuContextType>({
  waku: undefined,
  chatTopic: '',
});
export const useWaku = () => useContext(WakuContext);
