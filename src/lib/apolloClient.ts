import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

// Create Apollo Client for D&D 5e API
export const dndApiClient = new ApolloClient({
  uri: 'https://www.dnd5eapi.co/graphql/2014',
  cache: new InMemoryCache(),
});

// GraphQL query to fetch all equipment
export const GET_EQUIPMENT = gql`
  query GetEquipment {
    equipments {
      index
      name
      desc
      equipment_category {
        name
      }
      weight
      cost {
        quantity
        unit
      }
    }
  }
`;

// GraphQL query to fetch equipment by category
export const GET_EQUIPMENT_BY_CATEGORY = gql`
  query GetEquipmentByCategory($index: String!) {
    equipmentCategory(index: $index) {
      name
      equipment {
        index
        name
        desc
        equipment_category {
          name
        }
        weight
        cost {
          quantity
          unit
        }
      }
    }
  }
`;