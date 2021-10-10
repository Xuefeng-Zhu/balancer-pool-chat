export interface NetworkInfo {
  name: string;
  color: string;
  chainId: number;
  rpcUrl: string;
  blockTime: number;
}

export const INFURA_ID = process.env.REACT_APP_INFURA_ID;

export const NETWORKS = {
  localhost: {
    name: 'localhost',
    color: '#666666',
    chainId: 31337,
    rpcUrl:
      'https://poa-kovan.gateway.pokt.network/v1/lb/61614a8925e510003621d603',
    blockTime: 3000,
  },
  mainnet: {
    name: 'mainnet',
    color: '#29b6af',
    chainId: 1,
    rpcUrl:
      'https://poa-kovan.gateway.pokt.network/v1/lb/61614a8925e510003621d603',
    blockTime: 15000,
  },
  kovan: {
    name: 'kovan',
    color: '#7057ff',
    chainId: 42,
    rpcUrl:
      'https://poa-kovan.gateway.pokt.network/v1/lb/61614a8925e510003621d603',
    blockTime: 3000,
  },
  ropsten: {
    name: 'ropsten',
    color: '#ff4a8d',
    chainId: 3,
    rpcUrl:
      'https://poa-kovan.gateway.pokt.network/v1/lb/61614a8925e510003621d603',
    blockTime: 15000,
  },
  rinkeby: {
    name: 'rinkeby',
    color: '#f6c343',
    chainId: 4,
    rpcUrl:
      'https://poa-kovan.gateway.pokt.network/v1/lb/61614a8925e510003621d603',
    blockTime: 3000,
  },
};

export const getNetworkById: (chainId: number) => NetworkInfo = (
  chainId: number
) => {
  /* eslint-disable-next-line no-restricted-syntax */
  for (const network of Object.values(NETWORKS)) {
    if (network.chainId === chainId) {
      return network;
    }
  }
  return NETWORKS.localhost;
};
