import { gql } from '@apollo/client';

export const GET_MONSTER = gql`
  query GetMonster($index: String!) {
    monster(index: $index) {
      alignment
      challenge_rating
      hit_points
      index
      image
      armor_class {
        ... on ArmorClassDex {
          value
        }
        ... on ArmorClassArmor {
          value
        }
        ... on ArmorClassSpell {
          value
        }
        ... on ArmorClassCondition {
          value
        }
        ... on ArmorClassNatural {
          value
        }
      }
      size
      speed {
        burrow
        climb
        fly
        hover
        swim
        walk
      }
      type
      xp
      name
      actions {
        name
        desc
        attack_bonus
        dc {
          dc_value
          success_type
        }
        usage {
          min_value
          type
        }
        multiattack_type
        damage {
          ... on Damage {
            damage_dice
            damage_type {
              name
            }
          }
        }
        actions {
          count
          action_name
        }
      }
    }
  }
`;

export const GET_MONSTER_TYPES = gql`
  query GetMonsterTypes {
    monsters {
      type
      xp
    }
  }
`;

export const SEARCH_MONSTERS = gql`
  query SearchMonsters($type: String!) {
    monsters(type: $type) {
      index
      name
      type
      image
      challenge_rating
      hit_points
      xp
      armor_class {
        ... on ArmorClassDex {
          type
          value
        }
        ... on ArmorClassNatural {
          type
          value
        }
        ... on ArmorClassArmor {
          type
          value
        }
        ... on ArmorClassSpell {
          type
          value

        }
        ... on ArmorClassCondition {
          type
          value
        }
      }
    }
  }
`;
