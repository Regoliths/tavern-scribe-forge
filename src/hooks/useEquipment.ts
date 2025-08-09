import { useState, useEffect } from 'react';
import { dndApiClient, GET_EQUIPMENT } from '@/lib/apolloClient';
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

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const { data } = await dndApiClient.query({
          query: GET_EQUIPMENT,
        });

        // Transform API response to match our Item model
        const transformedEquipment: Item[] = data.equipments.map((item: DndApiEquipment, index: number) => ({
          id: index + 1, // Generate numeric ID since API uses string indices
          name: item.name,
          description: item.desc ? item.desc.join(' ') : '',
          type: item.equipment_category?.name || 'Equipment',
          quantity: 1, // Default quantity
          weight: item.weight || 0,
          cost: item.cost?.quantity || 0, // Convert to gold pieces (assuming gp is default)
        }));

        setEquipment(transformedEquipment);
      } catch (err) {
        console.error('Error fetching equipment:', err);
        setError('Failed to fetch equipment from D&D API');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  return { equipment, loading, error };
};