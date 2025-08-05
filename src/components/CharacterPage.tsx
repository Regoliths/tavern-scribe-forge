import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, Save, Trash2, Edit } from 'lucide-react';
import tavernBackground from "@/assets/tavern-background.jpg";
import axios from "axios";
import { Character, Race, Alignment, Class, Background } from '@/models/Character';
import {Item} from "@/models/Item.ts";
import { UpdateCharacterDto } from '@/models/UpdateCharacterDto';

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

export const getAllCharacters = async (): Promise<Character[]> => {
  try {
    // Use the generic <Character[]> to type the expected response data
    const response = await axios.get<Character[]>(`/api/character`);

    // response.data is now strongly typed as Character[]
    return response.data;
  } catch (error) {
    console.error("Error fetching characters:", error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
}

export const getCharacter = async (id: string): Promise<Character> => {
  try {
    // Use the generic <Character> to type the expected response data
    const response = await axios.get<Character>(`/api/character/${id}`);

    // response.data is now strongly typed as Character
    return response.data;
  } catch (error) {
    console.error(`Error finding character with id ${id}:`, error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
};

// Standard D&D 5e Equipment
const DND_EQUIPMENT: Item[] = [
  { id: 1001, name: "Longsword", type: "Weapon", weight: 3, quantity: 1, cost: 15, description: "A versatile one-handed sword. Damage: 1d8 slashing." },
  { id: 1002, name: "Shield", type: "Armor", weight: 6, quantity: 1, cost: 10, description: "+2 to AC when equipped." },
  { id: 1003, name: "Chain Mail", type: "Armor", weight: 55, quantity: 1, cost: 75, description: "Heavy armor. AC: 16." },
  { id: 1004, name: "Leather Armor", type: "Armor", weight: 10, quantity: 1, cost: 10, description: "Light armor. AC: 11 + Dex modifier." },
  { id: 1005, name: "Shortbow", type: "Weapon", weight: 2, quantity: 1, cost: 25, description: "Ranged weapon. Damage: 1d6 piercing. Range: 80/320." },
  { id: 1006, name: "Arrows (20)", type: "Ammunition", weight: 1, quantity: 1, cost: 1, description: "A quiver of 20 arrows." },
  { id: 1007, name: "Dagger", type: "Weapon", weight: 1, quantity: 1, cost: 2, description: "Light, finesse weapon. Damage: 1d4 piercing." },
  { id: 1008, name: "Handaxe", type: "Weapon", weight: 2, quantity: 1, cost: 5, description: "Light, thrown weapon. Damage: 1d6 slashing." },
  { id: 1009, name: "Backpack", type: "Gear", weight: 5, quantity: 1, cost: 2, description: "Can hold up to 30 lbs of gear." },
  { id: 1010, name: "Bedroll", type: "Gear", weight: 7, quantity: 1, cost: 1, description: "A soft blanket for sleeping outdoors." },
  { id: 1011, name: "Hemp Rope (50 feet)", type: "Gear", weight: 10, quantity: 1, cost: 2, description: "Strong rope for climbing or binding." },
  { id: 1012, name: "Torch", type: "Gear", weight: 1, quantity: 1, cost: 0.01, description: "Provides bright light for 1 hour." },
  { id: 1013, name: "Rations (1 day)", type: "Gear", weight: 2, quantity: 1, cost: 2, description: "Dried foods good for one day." },
  { id: 1014, name: "Waterskin", type: "Gear", weight: 5, quantity: 1, cost: 2, description: "Holds 4 pints of liquid." },
  { id: 1015, name: "Thieves' Tools", type: "Gear", weight: 1, quantity: 1, cost: 25, description: "Tools for picking locks and disarming traps." },
  { id: 1016, name: "Spell Component Pouch", type: "Gear", weight: 2, quantity: 1, cost: 25, description: "Contains material components for spells." },
  { id: 1017, name: "Health Potion", type: "Consumable", weight: 0.5, quantity: 1, cost: 50, description: "Restores 2d4+2 hit points when consumed." }
];

export const CharacterPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [character, setCharacter] = useState<Character | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // State to handle the loading process. We start in a loading state.
  const [loading, setLoading] = useState<boolean>(true);

  // State to hold any potential network errors.
  const [error, setError] = useState<string | null>(null);

  // API Functions
  const updateCharacter = async (updatedCharacter: Character): Promise<void> => {
    try {
      // Convert Character to UpdateCharacterDto format
      const updateDto: UpdateCharacterDto = {
        name: updatedCharacter.name,
        race: updatedCharacter.race,
        class: updatedCharacter.class,
        background: updatedCharacter.background,
        alignment: updatedCharacter.alignment,
        level: updatedCharacter.level,
        strength: updatedCharacter.strength,
        dexterity: updatedCharacter.dexterity,
        constitution: updatedCharacter.constitution,
        intelligence: updatedCharacter.intelligence,
        wisdom: updatedCharacter.wisdom,
        charisma: updatedCharacter.charisma,
        hitPoints: updatedCharacter.hitPoints,
        maxHitPoints: updatedCharacter.maxHitPoints,
        hitDice: 0, // Default value as schema expects number
        armorClass: updatedCharacter.armorClass,
        speed: updatedCharacter.speed,
        notes: updatedCharacter.notes,
        equipment: {
          characterId: updatedCharacter.id,
          totalWeight: updatedCharacter.equipment?.totalWeight || 0,
          items: updatedCharacter.equipment?.items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            type: item.type,
            quantity: item.quantity,
            weight: item.weight,
            cost: item.cost
          })) || []
        },
        inventory: {
          characterId: updatedCharacter.id,
          totalWeight: updatedCharacter.inventory?.totalWeight || 0,
          items: updatedCharacter.inventory?.items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            type: item.type,
            quantity: item.quantity,
            weight: item.weight,
            cost: item.cost
          })) || []
        },
        actions: updatedCharacter.actions?.map(action => ({
          id: action.id,
          name: action.name,
          description: action.description,
          range: 0, // Default value as schema expects number
          attackBonus: action.attackBonus || 0,
          damageType: action.damage?.damageType || "",
          diceCount: action.damage?.diceCount || 0,
          diceSize: action.damage?.diceSides || 0
        })) || []
      };

      await axios.put(`/api/character/${id}`, updateDto);
      toast({
        title: "Character Updated",
        description: "Your character has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating character:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update character. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCharacter = async (): Promise<void> => {
    try {
      await axios.delete(`/api/character/${id}`);
      toast({
        title: "Character Deleted",
        description: "Your character has been successfully deleted.",
      });
      navigate('/');
    } catch (error) {
      console.error("Error deleting character:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete character. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Inventory Management Functions
  const addItemToInventory = async (itemId: string, toEquipment = false) => {
    if (!character) return;
    
    const selectedEquipment = DND_EQUIPMENT.find(item => item.id.toString() === itemId);
    if (!selectedEquipment) return;

    const newItem: Item = {
      ...selectedEquipment,
      id: Date.now(), // Generate unique ID
      quantity: itemQuantity
    };

    const updatedCharacter = { ...character };
    
    if (toEquipment) {
      if (!updatedCharacter.equipment) {
        updatedCharacter.equipment = { 
          id: Date.now(), 
          characterId: character.id, 
          items: [], 
          totalWeight: 0 
        };
      }
      updatedCharacter.equipment.items.push(newItem);
      updatedCharacter.equipment.totalWeight = calculateTotalWeight(updatedCharacter.equipment.items);
    } else {
      if (!updatedCharacter.inventory) {
        updatedCharacter.inventory = { 
          id: Date.now(), 
          characterId: character.id, 
          items: [], 
          totalWeight: 0 
        };
      }
      updatedCharacter.inventory.items.push(newItem);
      updatedCharacter.inventory.totalWeight = calculateTotalWeight(updatedCharacter.inventory.items);
    }

    setCharacter(updatedCharacter);
    await updateCharacter(updatedCharacter);
    setSelectedItem("");
    setItemQuantity(1);
  };

  const removeItemFromInventory = async (itemId: number, fromEquipment = false) => {
    if (!character) return;

    const updatedCharacter = { ...character };
    
    if (fromEquipment && updatedCharacter.equipment) {
      updatedCharacter.equipment.items = updatedCharacter.equipment.items.filter(item => item.id !== itemId);
    } else if (updatedCharacter.inventory) {
      updatedCharacter.inventory.items = updatedCharacter.inventory.items.filter(item => item.id !== itemId);
    }

    setCharacter(updatedCharacter);
    await updateCharacter(updatedCharacter);
  };

  const saveCharacter = async () => {
    if (!character) return;
    await updateCharacter(character);
  };

  // 3. The useEffect Hook to Fetch Data on Load
  useEffect(() => {
    // We define an async function inside the effect to perform the fetch
    const fetchCharacterData = async () => {
      try {
        // Use the generic <Character> to tell axios the expected response type
        const response = await axios.get<Character>(`
        /api/character/${id}`);

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

  // Component for rendering inventory items with edit controls
  const EditableInventoryItemComponent = ({ item, fromEquipment = false }: { item: Item; fromEquipment?: boolean }) => (
    <div className="bg-parchment/10 border border-copper rounded p-3 mb-2">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="text-parchment font-medium">{item.name}</div>
          <Badge variant="outline" className="text-xs mt-1">{item.type}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right text-sm">
            <div className="text-copper">Qty: {item.quantity}</div>
            <div className="text-copper">{item.weight * item.quantity} lbs</div>
          </div>
          {isEditing && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => removeItemFromInventory(item.id, fromEquipment)}
              className="ml-2"
            >
              <Minus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      {item.description && (
        <p className="text-parchment/80 text-sm mb-2">{item.description}</p>
      )}
      <div className="text-copper text-sm">Cost: {item.cost} gp</div>
    </div>
  );

  // Component for adding new items
  const AddItemComponent = ({ toEquipment = false }: { toEquipment?: boolean }) => (
    <div className="bg-parchment/5 border border-copper border-dashed rounded p-3 mb-2">
      <div className="space-y-3">
        <Select value={selectedItem} onValueChange={setSelectedItem}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an item to add" />
          </SelectTrigger>
          <SelectContent>
            {DND_EQUIPMENT.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name} ({item.type}) - {item.cost} gp
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            className="w-20"
            placeholder="Qty"
          />
          <Button
            onClick={() => addItemToInventory(selectedItem, toEquipment)}
            disabled={!selectedItem}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add {toEquipment ? 'to Equipment' : 'to Backpack'}
          </Button>
        </div>
      </div>
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
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {equippedWeight} lbs
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      {isEditing ? 'Done' : 'Edit'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing && <AddItemComponent toEquipment={true} />}
                {character.equipment && character.equipment.items.length > 0 ? (
                  <div className="space-y-2">
                    {character.equipment.items.map((item) => (
                      <EditableInventoryItemComponent key={item.id} item={item} fromEquipment={true} />
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
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {backpackWeight} lbs
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      {isEditing ? 'Done' : 'Edit'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing && <AddItemComponent toEquipment={false} />}
                {character.inventory && character.inventory.items.length > 0 ? (
                  <div className="space-y-2">
                    {character.inventory.items.map((item) => (
                      <EditableInventoryItemComponent key={item.id} item={item} fromEquipment={false} />
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
          
          <div className="mt-8 flex justify-center gap-4">
            <Button 
              variant="outline" 
              className="bg-gradient-gold text-background hover:shadow-glow-gold"
              onClick={() => window.history.back()}
            >
              Back to Character Creator
            </Button>
            
            <Button 
              onClick={saveCharacter}
              className="flex items-center gap-2"
              variant="default"
            >
              <Save className="h-4 w-4" />
              Save Character
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Character
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {character.name} and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteCharacter} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Character
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};