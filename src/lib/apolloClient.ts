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

// GraphQL query to fetch all races
export const GET_RACES = gql`
  query GetRaces {
    races {
      index
      name
      ability_bonuses {
        ability_score {
          name
        }
        bonus
      }
      size
      speed
      languages {
        name
      }
      traits {
        name
        desc
      }
    }
  }
`;

// GraphQL query to fetch all classes
export const GET_CLASSES = gql`
  query GetClasses {
    classes {
      index
      name
      hit_die
      proficiency_choices {
        choose
        from {
          option_set_type
          options {
            item {
              ... on Proficiency {
                  name
              }
            }
          }
        }
      }
      proficiencies {
        name
      }
      saving_throws {
        name
      }
      spellcasting {
        level
        spellcasting_ability {
          name
        }
      }
    }
  }
`;

// GraphQL query to fetch all ability scores
export const GET_ABILITY_SCORES = gql`
  query GetAbilityScores {
    abilityScores {
      index
      name
      full_name
      desc
      skills {
        name
      }
    }
  }
`;

// Note: The D&D 5e API doesn't have backgrounds or alignments endpoints,
// so we'll keep those as constants for now