import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import tavernBackground from "@/assets/tavern-background.jpg";

interface Character {
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  level: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hitPoints: number;
  armorClass: number;
  speed: number;
  notes: string;
}

// Mock character data - in a real app, this would come from your backend/Supabase
const mockCharacter: Character = {
  name: "Thorin Ironforge",
  race: "Dwarf",
  class: "Fighter",
  background: "Folk Hero",
  alignment: "Lawful Good",
  level: 5,
  strength: 16,
  dexterity: 12,
  constitution: 15,
  intelligence: 10,
  wisdom: 13,
  charisma: 8,
  hitPoints: 45,
  armorClass: 18,
  speed: 25,
  notes: "A stalwart defender of the realm, wielding the ancestral hammer of his clan."
};

const getModifier = (score: number): string => {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

export const CharacterPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, you would fetch the character data using the id
  const character = mockCharacter;

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
                Level {character.level} {character.race} {character.class}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {character.background}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {character.alignment}
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
                      <div className="text-2xl font-bold text-parchment">{character.hitPoints}</div>
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