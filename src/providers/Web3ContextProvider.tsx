import {
  createContext,
  ReactChild,
  ReactChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAsync } from 'react-use';
import Web3Modal from 'web3modal';

import {
  JsonRpcProvider,
  JsonRpcSigner,
  Web3Provider,
  Provider,
} from '@ethersproject/providers';

import { getNetworkById } from '../constants';

const targetNetworkId = Number(process.env.REACT_APP_NETWORK_ID) || 42;

const web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions: {},
  theme: 'dark',
});

interface Web3ContextProps {
  provider: Provider | undefined;
  signer: JsonRpcSigner | undefined;
  network: string;
  address: string;
  rpcUrl: string;
  chainId: number;
  web3Modal: Web3Modal;
  loadWeb3Modal: () => Promise<void>;
  logoutOfWeb3Modal: () => Promise<void>;
}

interface Web3ContextProviderProps {
  children: ReactChild | ReactChild[] | ReactChildren | ReactChildren[];
}

export const Web3Context = createContext<Web3ContextProps>({
  provider: undefined,
  signer: undefined,
  address: '',
  rpcUrl: '',
  network: getNetworkById(targetNetworkId).name,
  chainId: 0,
  web3Modal,
  loadWeb3Modal: async () => {},
  logoutOfWeb3Modal: async () => {},
});

export const Web3ContextProvider = ({
  children,
}: Web3ContextProviderProps): JSX.Element => {
  const networkObject = getNetworkById(targetNetworkId);
  const [provider, setProvider] = useState<JsonRpcProvider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [network, setNetwork] = useState(networkObject.name);
  const [address, setAddress] = useState('');
  const [rpcUrl, setRpcUrl] = useState(networkObject.rpcUrl);
  const [chainId, setChainId] = useState(0);
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const [web3Connection, setWeb3Connection] = useState<any>();

  useAsync(async () => {
    if (!web3Connection) {
      return;
    }
    web3Connection.on('accountsChanged', () => {
      window.location.reload();
    });
    web3Connection.on('chainChanged', () => {
      window.location.reload();
    });
  }, [web3Connection]);

  useAsync(async () => {
    if (!provider) {
      return;
    }

    const networkData = await provider.getNetwork();
    setChainId(networkData.chainId);
    setNetwork(networkData.name);
    setRpcUrl(getNetworkById(networkData.chainId).rpcUrl);
  }, [provider]);

  const loadWeb3Modal = useCallback(async () => {
    const connection = await web3Modal.connect();
    setWeb3Connection(connection);
    const newProvider = new Web3Provider(connection);
    setProvider(newProvider);

    const newSigner = newProvider.getSigner();
    setSigner(newSigner);
    setAddress(await newSigner.getAddress());
  }, []);

  const logoutOfWeb3Modal = useCallback(async () => {
    if (web3Connection && web3Connection.close) {
      web3Connection.close();
    }
    web3Modal.clearCachedProvider();
    window.location.reload();
  }, [web3Connection]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  useEffect(() => {
    const rpcProvider = new JsonRpcProvider(networkObject.rpcUrl);
    setProvider(rpcProvider);
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        network,
        address,
        rpcUrl,
        chainId,
        web3Modal,
        loadWeb3Modal,
        logoutOfWeb3Modal,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3Context: () => Web3ContextProps = () =>
  useContext(Web3Context);
