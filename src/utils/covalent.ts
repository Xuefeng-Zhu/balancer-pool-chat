import axios from 'axios';
import { utils } from 'ethers';

const apiKey = 'ckey_8577bd61fc5848c9b5510fab0d2';

export async function getPortofolio(address: string): Promise<string> {
  const res = await axios.get(
    `https://api.covalenthq.com/v1/1/address/${address}/balances_v2/?&key=${apiKey}`
  );

  const { data }: any = res.data;
  const result: string[] = [];

  data.items.forEach((item: any) => {
    result.push(
      `${item.contract_ticker_symbol}: ${utils.formatUnits(
        item.balance,
        item.contract_decimals
      )}`
    );
  });

  return result.join('\n');
}
