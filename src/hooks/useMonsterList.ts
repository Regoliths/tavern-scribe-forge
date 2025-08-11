import { useState, useEffect } from 'react';
import { dndApiClient } from '@/lib/dndApiClient';
import { GET_MONSTER_TYPES, SEARCH_MONSTERS } from '@/lib/queries/monster';

export const useMonsterTypes = () => {
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    dndApiClient.query({
      query: GET_MONSTER_TYPES,
      fetchPolicy: 'network-only',
    })
      .then(({ data }) => {
        if (data && data.monsters) {
          // Extract unique types from the monsters array
          const allTypes = data.monsters.map((m: any) => m.type).filter(Boolean);
          setTypes(Array.from(new Set(allTypes)));
        } else {
          setTypes([]);
        }
      })
      .catch((err) => setError(err.message || 'Failed to fetch monster types.'))
      .finally(() => setLoading(false));
  }, []);

  return { types, loading, error };
};

export const useMonsterSearch = (type: string) => {
  const [monsters, setMonsters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!type) {
      setMonsters([]);
      return;
    }
    setLoading(true);
    setError(null);
    dndApiClient.query({
      query: SEARCH_MONSTERS,
      variables: { type },
      fetchPolicy: 'network-only',
    })
      .then(({ data }) => {
        if (data && data.monsters) {
          setMonsters(data.monsters);
        } else {
          setMonsters([]);
        }
      })
      .catch((err) => setError(err.message || 'Failed to fetch monsters.'))
      .finally(() => setLoading(false));
  }, [type]);

  return { monsters, loading, error };
};
