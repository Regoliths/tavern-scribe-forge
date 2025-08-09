import { useState, useEffect } from 'react';
import { dndApiClient, GET_RACES, GET_CLASSES, GET_ABILITY_SCORES } from '@/lib/apolloClient';

interface Race {
  index: string;
  name: string;
  ability_bonuses: Array<{
    ability_score: { name: string };
    bonus: number;
  }>;
  size: string;
  speed: number;
}

interface DndClass {
  index: string;
  name: string;
  hit_die: number;
  proficiencies: Array<{ name: string }>;
  saving_throws: Array<{ name: string }>;
}

interface AbilityScore {
  index: string;
  name: string;
  full_name: string;
  desc: string[];
}

export const useDndData = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [classes, setClasses] = useState<DndClass[]>([]);
  const [abilityScores, setAbilityScores] = useState<AbilityScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // These are not available in the D&D 5e API, so we keep them as constants
  const backgrounds = [
    "Acolyte", "Criminal", "Folk Hero", "Noble", "Sage", "Soldier", "Charlatan",
    "Entertainer", "Guild Artisan", "Hermit", "Outlander", "Sailor"
  ];

  const alignments = [
    "Lawful Good", "Neutral Good", "Chaotic Good",
    "Lawful Neutral", "True Neutral", "Chaotic Neutral", 
    "Lawful Evil", "Neutral Evil", "Chaotic Evil"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [racesResult, classesResult, abilityScoresResult] = await Promise.all([
          dndApiClient.query({ query: GET_RACES }),
          dndApiClient.query({ query: GET_CLASSES }),
          dndApiClient.query({ query: GET_ABILITY_SCORES })
        ]);

        setRaces(racesResult.data.races);
        setClasses(classesResult.data.classes);
        setAbilityScores(abilityScoresResult.data.abilityScores);
      } catch (err) {
        console.error('Error fetching D&D data:', err);
        setError('Failed to fetch D&D data from API');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get hit die for a class
  const getHitDieForClass = (className: string): number => {
    const foundClass = classes.find(cls => cls.name === className);
    return foundClass?.hit_die || 8; // Default to d8 if not found
  };

  // Helper function to get class hit dice mapping
  const getClassHitDice = (): Record<string, number> => {
    const hitDiceMap: Record<string, number> = {};
    classes.forEach(cls => {
      hitDiceMap[cls.name] = cls.hit_die;
    });
    return hitDiceMap;
  };

  return {
    races: races.map(race => race.name),
    classes: classes.map(cls => cls.name),
    backgrounds,
    alignments,
    abilityScores,
    loading,
    error,
    getHitDieForClass,
    getClassHitDice,
    rawRaces: races,
    rawClasses: classes
  };
};
