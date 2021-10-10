import { useQuery, gql } from '@apollo/client';
import { List, Alert } from 'antd';
import { useHash } from 'react-use';

const POOLS_GQL = gql(`
{
  pools(first: 1000, where: {totalLiquidity_gt: 100000}) {
    id
    name
    holdersCount
  }
}
`);

export default function PoolList() {
  const [, setHash] = useHash();
  const { loading, data } = useQuery(POOLS_GQL, { pollInterval: 2500 });

  return (
    <List
      bordered
      size="large"
      loading={loading}
      dataSource={data?.pools}
      renderItem={(pool: any) => (
        <List.Item
          onClick={() => {
            setHash(`#/${pool.id}`);
          }}
        >
          <List.Item.Meta
            title={pool.name}
            description={`Holders: ${pool.holdersCount}`}
          />
        </List.Item>
      )}
      header={
        <Alert message="Please select a balancer pool" type="info" showIcon />
      }
    />
  );
}
