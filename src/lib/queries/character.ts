import { gql } from '@apollo/client';

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

