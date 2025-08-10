import { dndApiClient } from '@/lib/dndApiClient';
import { GET_MONSTER } from '@/lib/queries/monster';
import { useState, useEffect } from 'react';

export interface MonsterCombatant {
  id: number;
  name: string;
  ac: number;
  maxHp: number;
  currentHp: number;
  initiative: number;
  position: { x: number; y: number };
  movement: number;
  image?: string;
  monsterType?: string;
  xp?: number;
  alignment?: string;
  challenge_rating?: number;
  actions: { name: string; desc: string; attackBonus?: number; damage?: string; damageType?: string }[];
  multiattack_type?: string;
  multiattack?: {
    attacks: { name: string; count: number }[];
    desc: string;
  };
}

export const useMonster = (monsterIndex: string) => {
  const [monster, setMonster] = useState<MonsterCombatant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!monsterIndex) return;
    setLoading(true);
    setError(null);
    dndApiClient.query({
      query: GET_MONSTER,
      variables: { index: monsterIndex },
      fetchPolicy: 'network-only',
    })
      .then(({ data }) => {
        if (data && data.monster) {
          const m = data.monster;
          const ac = Array.isArray(m.armor_class) ? m.armor_class[0]?.value : m.armor_class?.value || 12;
          let movement = 30;
          if (m.speed && typeof m.speed.walk === 'string') {
            const match = m.speed.walk.match(/(\d+)/);
            if (match) movement = parseInt(match[1], 10);
          }
          let multiattack_type = m.multiattack_type;
          let multiattack: MonsterCombatant['multiattack'] = undefined;
          const multiattackAction = (m.actions || []).find((a: any) => a.name === 'Multiattack');
          if (multiattackAction && multiattack_type === 'actions') {
            const attacks: { name: string; count: number }[] = [];
            if (multiattackAction.actions && Array.isArray(multiattackAction.actions)) {
              multiattackAction.actions.forEach((a: any) => {
                attacks.push({ name: a.action_name, count: parseInt(a.count) });
              });
            }
            multiattack = { attacks, desc: multiattackAction.desc };
          }
          setMonster({
            id: 10001, // Arbitrary unique id for monster
            name: m.name,
            ac: ac,
            maxHp: m.hit_points,
            currentHp: m.hit_points,
            initiative: 0,
            position: { x: 0, y: 0 },
            movement: movement,
            image: m.image ? 'https://www.dnd5eapi.co' + m.image : undefined,
            monsterType: m.type,
            xp: m.xp,
            alignment: m.alignment,
            challenge_rating: m.challenge_rating,
            actions: (m.actions || []).map((a: any) => ({
              name: a.name,
              desc: a.desc,
              attackBonus: a.attack_bonus || 0,
              damage: a.damage && a.damage[0] ? a.damage[0].damage_dice : '',
              damageType: a.damage && a.damage[0] && a.damage[0].damage_type ? a.damage[0].damage_type.name : '',
            })),
            multiattack_type,
            multiattack,
          });
          //log the monster data for debugging
            console.log('Monster data:', m);
        } else {
          setError('No monster data found.');
        }
      })
      .catch((err) => setError(err.message || 'Failed to fetch monster.'))
      .finally(() => setLoading(false));
  }, [monsterIndex]);

  return { monster, loading, error };
};

