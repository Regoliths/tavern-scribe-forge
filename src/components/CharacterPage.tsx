import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import tavernBackground from "@/assets/tavern-background.jpg";
import axios from "axios";
import { Character, Race, Alignment, Class, Background } from '@/models/Character';
import {Item} from "@/models/Item.ts";

interface CharacterPageProps {
  characterId: string;
}

const getModifier = (score: number): string => {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

/**
 * Fetches a single character by its ID from the API.
 * @param id The ID of the character to fetch.
 * @returns A Promise that resolves to the Character object.
 */
export const getCharacter = async (id: string): Promise<Character> => {
  try {
    // Use the generic <Character> to type the expected response data
    const response = await axios.get<Character>(`http://localhost:5181/api/character/${id}`);

    // response.data is now strongly typed as Character
    return response.data;
  } catch (error) {
    console.error(`Error finding character with id ${id}:`, error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
};
export const CharacterPage = () => {
  const { id } = useParams<{ id: string }>();

  const [character, setCharacter] = useState<Character | null>(null);

  // State to handle the loading process. We start in a loading state.
  const [loading, setLoading] = useState<boolean>(true);

  // State to hold any potential network errors.
  const [error, setError] = useState<string | null>(null);

  // 3. The useEffect Hook to Fetch Data on Load
  useEffect(() => {
    // We define an async function inside the effect to perform the fetch
    const fetchCharacterData = async () => {
      try {
        // Use the generic <Character> to tell axios the expected response type
        const response = await axios.get<Character>(`http://localhost:5181/api/character/${id}`);

        // The promise has resolved. Set the character data in state.
        
        setCharacter(response.data);
        

      } catch (err) {
        // The promise was rejected. Set an error message.
        setError("Failed to fetch character. Please check the ID and try again.");
        console.error("Error fetching character:", err);
      } finally {
        // This runs whether the fetch succeeded or failed.
        // We are no longer loading.
        setLoading(false);
      }
    };

    // Call the function to start the data fetching process
    fetchCharacterData();

    // The dependency array [characterId] means this effect will run once when the
    // component mounts, and re-run ONLY if the characterId prop changes.
  }, [id]);

  // 4. Conditional Rendering Logic
  // Show a loading message while the fetch is in progress
  if (loading) {
    return <div>Loading character details...</div>;
  }

  // Show an error message if the fetch failed
  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  // If there's no character data for some reason after loading
  if (!character) {
    return <div>Character not found.</div>;
  }

  // Helper functions for inventory calculations
  const calculateTotalWeight = (items: Array<Item> = []): number => {
    if (!Array.isArray(items)) {
      // If it's not an array (it could be null, undefined, etc.),
      // then the total weight is 0.
      return 0;
    }
    
    return items.reduce((total, item) => total + (item.weight * item.quantity), 0);
  };

  const equippedWeight = calculateTotalWeight(character?.equipment?.items ?? []);
  const backpackWeight = calculateTotalWeight(character?.inventory?.items ?? []);
  const totalWeight = equippedWeight + backpackWeight;

  // Component for rendering inventory items
  const InventoryItemComponent = ({ item }: { item: Item }) => (
    <div className="bg-parchment/10 border border-copper rounded p-3 mb-2">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="text-parchment font-medium">{item.name}</div>
          <Badge variant="outline" className="text-xs mt-1">{item.type}</Badge>
        </div>
        <div className="text-right text-sm">
          <div className="text-copper">Qty: {item.quantity}</div>
          <div className="text-copper">{item.weight * item.quantity} lbs</div>
        </div>
      </div>
      {item.description && (
        <p className="text-parchment/80 text-sm mb-2">{item.description}</p>
      )}
      <div className="text-copper text-sm">Cost: {item.cost} gp</div>
    </div>
  );

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${tavernBackground})` }}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-4 font-cinzel">
              {character.name}
            </h1>
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Level {character.level} {Race[character.race]} {Class[character.class]}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {Background[character.background]}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {Alignment[character.alignment]}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ability Scores */}
            <Card className="bg-wood-dark/80 border-copper backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-cinzel text-parchment">Ability Scores</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {[
                  { name: "Strength", value: character.strength },
                  { name: "Dexterity", value: character.dexterity },
                  { name: "Constitution", value: character.constitution },
                  { name: "Intelligence", value: character.intelligence },
                  { name: "Wisdom", value: character.wisdom },
                  { name: "Charisma", value: character.charisma }
                ].map((ability) => (
                  <div key={ability.name} className="text-center">
                    <div className="bg-parchment/10 border border-copper rounded p-3">
                      <div className="text-sm font-medium text-copper mb-1">{ability.name}</div>
                      <div className="text-2xl font-bold text-parchment">{ability.value}</div>
                      <div className="text-sm text-copper">
                        {getModifier(ability.value)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Combat Stats */}
            <Card className="bg-wood-dark/80 border-copper backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-cinzel text-parchment">Combat Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-parchment/10 border border-copper rounded p-3">
                      <div className="text-sm font-medium text-copper mb-1">Hit Points</div>
                      <div className="text-2xl font-bold text-parchment">{character.hitPoints} / {character.maxHitPoints}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-parchment/10 border border-copper rounded p-3">
                      <div className="text-sm font-medium text-copper mb-1">Armor Class</div>
                      <div className="text-2xl font-bold text-parchment">{character.armorClass}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-parchment/10 border border-copper rounded p-3">
                      <div className="text-sm font-medium text-copper mb-1">Speed</div>
                      <div className="text-2xl font-bold text-parchment">{character.speed} ft</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Character Notes */}
            <Card className="bg-wood-dark/80 border-copper backdrop-blur-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-2xl font-cinzel text-parchment">Character Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-parchment/10 border border-copper rounded p-4">
                  <p className="text-parchment whitespace-pre-wrap">
                    {character.notes || "No notes recorded for this character."}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-wood-dark/80 border-copper backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-cinzel text-parchment flex justify-between items-center">
                  Equipped Items
                  <Badge variant="secondary" className="text-sm">
                    {equippedWeight} lbs
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {character.equipment && character.equipment.items.length > 0 ? (
                  <div className="space-y-2">
                    {character.equipment.items.map((item) => (
                      <InventoryItemComponent key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-parchment/60">
                    No equipped items
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-wood-dark/80 border-copper backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-cinzel text-parchment flex justify-between items-center">
                  Backpack
                  <Badge variant="secondary" className="text-sm">
                    {backpackWeight} lbs
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {character.inventory && character.inventory.items.length > 0 ? (
                  <div className="space-y-2">
                    {character.inventory.items.map((item) => (
                      <InventoryItemComponent key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-parchment/60">
                    Backpack is empty
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-wood-dark/80 border-copper backdrop-blur-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-2xl font-cinzel text-parchment">Weight Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-parchment/10 border border-copper rounded p-3">
                      <div className="text-sm font-medium text-copper mb-1">Equipped Weight</div>
                      <div className="text-2xl font-bold text-parchment">{equippedWeight} lbs</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-parchment/10 border border-copper rounded p-3">
                      <div className="text-sm font-medium text-copper mb-1">Backpack Weight</div>
                      <div className="text-2xl font-bold text-parchment">{backpackWeight} lbs</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-parchment/10 border border-copper rounded p-3">
                      <div className="text-sm font-medium text-copper mb-1">Total Weight</div>
                      <div className="text-2xl font-bold text-parchment">{totalWeight} lbs</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              className="bg-gradient-gold text-background hover:shadow-glow-gold"
              onClick={() => window.history.back()}
            >
              Back to Character Creator
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};