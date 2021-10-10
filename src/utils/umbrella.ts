import {
  ContractRegistry,
  ChainContract,
  APIClient,
} from '@umb-network/toolbox';
import { JsonRpcProvider } from '@ethersproject/providers';
const contractRegistryAddress = '0x41a75b8504fdac22b2152b5cfcdaae01ff50947e';

export async function getUmbrellaData(key: string): Promise<string> {
  const provider = new JsonRpcProvider(
    'https://eth-trace.gateway.pokt.network/v1/lb/6162655f25e5100036233eb3'
  );

  const chainContractAddress = await new ContractRegistry(
    provider,
    contractRegistryAddress
  ).getAddress('Chain');
  const chainContract = new ChainContract(provider, chainContractAddress);

  const apiClient = new APIClient({
    chainContract,
    chainId: 'ethereum',
    apiKey: 'e63adf9a5c9030eb9949f4b1f42781a0cd1e36806b22b7db1bcd9153e19eef11',
    baseURL: 'https://api.umb.network/',
  });

  const verificationResult = await apiClient.verifyProofForNewestBlock(key);

  return `${key}: ${verificationResult.value}`;
}
