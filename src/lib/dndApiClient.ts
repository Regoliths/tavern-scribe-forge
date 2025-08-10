import { ApolloClient, InMemoryCache } from '@apollo/client';

// Create Apollo Client for D&D 5e API
export const dndApiClient = new ApolloClient({
  uri: 'https://www.dnd5eapi.co/graphql/2014',
  cache: new InMemoryCache(),
});

