import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import App from './App';
import { Web3ContextProvider } from './providers/Web3ContextProvider';

import './index.css';
import 'antd/dist/antd.css';

const subgraphUri =
  'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-kovan-v2';

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <React.StrictMode>
    <Web3ContextProvider>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
      ,
    </Web3ContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
