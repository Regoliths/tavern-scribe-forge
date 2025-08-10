import { useState, useEffect } from 'react';
import { dndApiClient, GET_EQUIPMENT_BY_CATEGORY, GET_EQUIPMENT_CATEGORIES } from '@/lib/apolloClient';
import { Item } from '@/models/Item';

interface DndApiEquipment {
  index: string;
  name: string;
  desc: string[];
  equipment_category: {
    name: string;
  };
  weight: number;
  cost: {
    quantity: number;
    unit: string;
  };
}

let globalItemId = 1000;

export const useEquipment = () => {
  const [categories, setCategories] = useState<{ index: string; name?: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [equipment, setEquipment] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await dndApiClient.query({
          query: GET_EQUIPMENT_CATEGORIES,
          fetchPolicy: 'network-only',
        });
        setCategories(data.equipmentCategories || []);
      } catch (err) {
        setError('Failed to fetch equipment categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch equipment when selectedCategory changes
  useEffect(() => {
    if (!selectedCategory) {
      setEquipment([]);
      setLoading(false);
      return;
    }
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const { data } = await dndApiClient.query({
          query: GET_EQUIPMENT_BY_CATEGORY,
          variables: { index: selectedCategory },
          fetchPolicy: 'network-only',
        });
        const items = data.equipmentCategory?.equipment || [];
        // Transform API response to match our Item model
        const transformedEquipment: Item[] = items.map((item: any) => {
          // Weapon
          let damageDice, damageType;
          if (item.damage) {
            damageDice = item.damage.damage_dice;
            damageType = item.damage.damage_type?.name;
          }
          // Armor
          let armorClass, armorType, acBonus;
          if (item.armor_class) {
            armorClass = item.armor_class.base;
            armorType = item.armor_category || item.equipment_category?.name;
          }
          // Shield
          if (item.equipment_category?.name?.toLowerCase() === 'shield') {
            acBonus = item.armor_class?.base || 2; // Default shield bonus if not present
            armorType = 'shield';
          }
          return {
            id: globalItemId++,
            name: item.name,
            description: item.desc ? (Array.isArray(item.desc) ? item.desc.join(' ') : item.desc) : '',
            type: item.equipment_category?.name || 'Equipment',
            quantity: 1,
            weight: item.weight || 0,
            cost: item.cost?.quantity || 0,
            damageDice,
            damageType,
            armorClass,
            acBonus,
            armorType,
          };
        });
        setEquipment(transformedEquipment);
      } catch (err) {
        setError('Failed to fetch equipment from D&D API');
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [selectedCategory]);

  return { categories, selectedCategory, setSelectedCategory, equipment, loading, error };
};