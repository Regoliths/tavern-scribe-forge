import { gql } from '@apollo/client';

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

export const GET_EQUIPMENT_CATEGORIES = gql`
  query GetEquipmentCategory {
    equipmentCategories {
      index
    }
  }
`;

export const GET_EQUIPMENT_BY_CATEGORY = gql`
  query GetEquipmentByCategory($index: String!) {
    equipmentCategory(index: $index) {
      name
      equipment {
        ... on IEquipment {
          index
          name
          weight
          cost {
            quantity
            unit
          }
        }
        ... on Ammunition {
          index
          name
          equipment_category {
            name
          }
          weight
          cost {
            quantity
            unit
          }
        }
        ... on Armor {
          index
          name
          equipment_category {
            name
          }
          weight
          cost {
            quantity
            unit
          }
          armor_class {
            base
          }
        }
        ... on Gear {
          index
          name
          equipment_category {
            name
          }
          weight
          cost {
            quantity
            unit
          }
        }
        ... on MagicItem {
          index
          name
          desc
          equipment_category {
            name
          }
        }
        ... on Weapon {
          index
          name
          weight
          equipment_category {
            name
          }
          damage {
            damage_dice
            damage_type {
              name
            }
          }
          cost {
            quantity
            unit
          }
        }
      }
    }
  }
`;

