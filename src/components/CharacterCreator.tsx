import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import tavernBackground from "@/assets/tavern-background.jpg";
import axios from "axios"; // Import axios for making HTTP requests

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

const races = [
  "Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Gnome", "Half-Elf", 
  "Half-Orc", "Tiefling", "Genasi", "Goliath", "Aasimar", "Firbolg"
];

const classes = [
  "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin",
  "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"
];

const backgrounds = [
  "Acolyte", "Criminal", "Folk Hero", "Noble", "Sage", "Soldier", "Charlatan",
  "Entertainer", "Guild Artisan", "Hermit", "Outlander", "Sailor"
];

const alignments = [
  "Lawful Good", "Neutral Good", "Chaotic Good",
  "Lawful Neutral", "True Neutral", "Chaotic Neutral", 
  "Lawful Evil", "Neutral Evil", "Chaotic Evil"
];

export function CharacterCreator() {
  const [character, setCharacter] = useState<Character>({
    name: "",
    race: "",
    class: "",
    background: "",
    alignment: "",
    level: 1,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    hitPoints: 8,
    armorClass: 10,
    speed: 30,
    notes: ""
  });

  const updateCharacter = (field: keyof Character, value: string | number) => {
    setCharacter(prev => ({ ...prev, [field]: value }));
  };

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const rollAbilityScore = (ability: keyof Character) => {
    // Roll 4d6, drop lowest
    const rolls = Array(4).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => b - a);
    const total = rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    updateCharacter(ability, total);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${tavernBackground})` }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-gold drop-shadow-lg">
            Character Creator
          </h1>
          <p className="text-xl text-parchment drop-shadow-md">
            Forge your legend in the realm of D&D 5th Edition
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Basic Information */}
          <Card className="bg-gradient-wood border-2 border-copper shadow-medieval">
            <CardHeader className="bg-gradient-gold text-background rounded-t-lg">
              <CardTitle className="text-xl font-bold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <Label htmlFor="name" className="text-parchment font-semibold">Character Name</Label>
                <Input
                  id="name"
                  value={character.name}
                  onChange={(e) => updateCharacter("name", e.target.value)}
                  className="bg-parchment/10 border-copper text-parchment placeholder:text-muted-foreground"
                  placeholder="Enter character name..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-parchment font-semibold">Race</Label>
                  <Select value={character.race} onValueChange={(value) => updateCharacter("race", value)}>
                    <SelectTrigger className="bg-parchment/10 border-copper text-parchment">
                      <SelectValue placeholder="Select race" />
                    </SelectTrigger>
                    <SelectContent className="bg-wood-dark border-copper">
                      {races.map(race => (
                        <SelectItem key={race} value={race} className="text-parchment hover:bg-copper/20">
                          {race}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-parchment font-semibold">Class</Label>
                  <Select value={character.class} onValueChange={(value) => updateCharacter("class", value)}>
                    <SelectTrigger className="bg-parchment/10 border-copper text-parchment">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="bg-wood-dark border-copper">
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls} className="text-parchment hover:bg-copper/20">
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-parchment font-semibold">Background</Label>
                <Select value={character.background} onValueChange={(value) => updateCharacter("background", value)}>
                  <SelectTrigger className="bg-parchment/10 border-copper text-parchment">
                    <SelectValue placeholder="Select background" />
                  </SelectTrigger>
                  <SelectContent className="bg-wood-dark border-copper">
                    {backgrounds.map(bg => (
                      <SelectItem key={bg} value={bg} className="text-parchment hover:bg-copper/20">
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-parchment font-semibold">Alignment</Label>
                <Select value={character.alignment} onValueChange={(value) => updateCharacter("alignment", value)}>
                  <SelectTrigger className="bg-parchment/10 border-copper text-parchment">
                    <SelectValue placeholder="Select alignment" />
                  </SelectTrigger>
                  <SelectContent className="bg-wood-dark border-copper">
                    {alignments.map(alignment => (
                      <SelectItem key={alignment} value={alignment} className="text-parchment hover:bg-copper/20">
                        {alignment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level" className="text-parchment font-semibold">Level</Label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  max="20"
                  value={character.level}
                  onChange={(e) => updateCharacter("level", parseInt(e.target.value) || 1)}
                  className="bg-parchment/10 border-copper text-parchment"
                />
              </div>
            </CardContent>
          </Card>

          {/* Ability Scores */}
          <Card className="bg-gradient-wood border-2 border-copper shadow-medieval">
            <CardHeader className="bg-gradient-gold text-background rounded-t-lg">
              <CardTitle className="text-xl font-bold">Ability Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].map((ability) => (
                <div key={ability} className="flex items-center justify-between space-x-3">
                  <Label className="text-parchment font-semibold capitalize min-w-[100px]">
                    {ability}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="3"
                      max="20"
                      value={character[ability as keyof Character]}
                      onChange={(e) => updateCharacter(ability as keyof Character, parseInt(e.target.value) || 10)}
                      className="w-16 bg-parchment/10 border-copper text-parchment text-center"
                    />
                    <Badge variant="outline" className="border-gold text-gold min-w-[40px] text-center">
                      {getModifier(character[ability as keyof Character] as number) >= 0 ? '+' : ''}
                      {getModifier(character[ability as keyof Character] as number)}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => rollAbilityScore(ability as keyof Character)}
                      className="bg-copper hover:bg-copper/80 text-parchment shadow-inset"
                    >
                      Roll
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button 
                className="w-full bg-gradient-gold text-background hover:shadow-glow-gold"
                onClick={() => {
                  ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].forEach(ability => {
                    rollAbilityScore(ability as keyof Character);
                  });
                }}
              >
                Roll All Abilities
              </Button>
            </CardContent>
          </Card>

          {/* Combat Stats & Notes */}
          <Card className="bg-gradient-wood border-2 border-copper shadow-medieval lg:col-span-2 xl:col-span-1">
            <CardHeader className="bg-gradient-gold text-background rounded-t-lg">
              <CardTitle className="text-xl font-bold">Combat & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="hitPoints" className="text-parchment font-semibold">Hit Points</Label>
                  <Input
                    id="hitPoints"
                    type="number"
                    min="1"
                    value={character.hitPoints}
                    onChange={(e) => updateCharacter("hitPoints", parseInt(e.target.value) || 1)}
                    className="bg-parchment/10 border-copper text-parchment"
                  />
                </div>
                
                <div>
                  <Label htmlFor="armorClass" className="text-parchment font-semibold">Armor Class</Label>
                  <Input
                    id="armorClass"
                    type="number"
                    min="1"
                    value={character.armorClass}
                    onChange={(e) => updateCharacter("armorClass", parseInt(e.target.value) || 10)}
                    className="bg-parchment/10 border-copper text-parchment"
                  />
                </div>
                
                <div>
                  <Label htmlFor="speed" className="text-parchment font-semibold">Speed (ft)</Label>
                  <Input
                    id="speed"
                    type="number"
                    min="0"
                    value={character.speed}
                    onChange={(e) => updateCharacter("speed", parseInt(e.target.value) || 30)}
                    className="bg-parchment/10 border-copper text-parchment"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-parchment font-semibold">Character Notes</Label>
                <Textarea
                  id="notes"
                  value={character.notes}
                  onChange={(e) => updateCharacter("notes", e.target.value)}
                  placeholder="Add backstory, personality traits, equipment, or other notes..."
                  className="bg-parchment/10 border-copper text-parchment placeholder:text-muted-foreground min-h-[120px]"
                />
              </div>

              <Button
                  className="w-full bg-gradient-gold text-background hover:shadow-glow-gold"
                  onClick={async () => {
                    try {
                      await axios.post("http://localhost:5181/api/character", character);
                      alert("Character saved successfully!");
                    } catch (error) {
                      console.error("Error saving character:", error);
                      alert("Failed to save character.");
                    }
                  }}
              >
                Save Character
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Character Summary */}
        {character.name && (
          <Card className="mt-8 bg-gradient-parchment border-2 border-gold shadow-medieval max-w-4xl mx-auto">
            <CardHeader className="bg-gradient-gold text-background rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-center">Character Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-3xl font-bold text-wood-dark mb-2">{character.name}</h3>
                <p className="text-lg text-muted-foreground">
                  Level {character.level} {character.race} {character.class}
                </p>
                {character.background && <p className="text-copper font-semibold">{character.background}</p>}
                {character.alignment && <p className="text-sm text-muted-foreground">{character.alignment}</p>}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                {["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].map((ability) => (
                  <div key={ability} className="text-center">
                    <p className="font-semibold text-wood-dark capitalize text-sm">{ability.slice(0, 3)}</p>
                    <p className="text-2xl font-bold text-copper">
                      {character[ability as keyof Character]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ({getModifier(character[ability as keyof Character] as number) >= 0 ? '+' : ''}
                      {getModifier(character[ability as keyof Character] as number)})
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-semibold text-wood-dark">Hit Points</p>
                  <p className="text-xl font-bold text-destructive">{character.hitPoints}</p>
                </div>
                <div>
                  <p className="font-semibold text-wood-dark">Armor Class</p>
                  <p className="text-xl font-bold text-accent">{character.armorClass}</p>
                </div>
                <div>
                  <p className="font-semibold text-wood-dark">Speed</p>
                  <p className="text-xl font-bold text-primary">{character.speed} ft</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}