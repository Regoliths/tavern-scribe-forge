import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Heart, Move } from 'lucide-react';

interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'npc';
  ac: number;
  maxHp: number;
  currentHp: number;
  initiative: number;
  position: { x: number; y: number };
  movement: number;
  equipment: string[];
  actions: string[];
  isMoving: boolean;
}

interface GridPosition {
  x: number;
  y: number;
  occupied?: string; // combatant id
}

const CombatPage: React.FC = () => {
  const [combatants, setCombatants] = useState<Combatant[]>([
    // Players
    {
      id: 'player1',
      name: 'Aragorn',
      type: 'player',
      ac: 18,
      maxHp: 45,
      currentHp: 45,
      initiative: 15,
      position: { x: 2, y: 8 },
      movement: 30,
      equipment: ['Longsword', 'Chain Mail', 'Shield'],
      actions: ['Attack', 'Dodge', 'Dash'],
      isMoving: false
    },
    {
      id: 'player2',
      name: 'Legolas',
      type: 'player',
      ac: 16,
      maxHp: 38,
      currentHp: 38,
      initiative: 18,
      position: { x: 1, y: 7 },
      movement: 30,
      equipment: ['Elven Bow', 'Leather Armor', 'Quiver'],
      actions: ['Ranged Attack', 'Hide', 'Dash'],
      isMoving: false
    },
    // NPCs
    {
      id: 'direwolf1',
      name: 'Direwolf Alpha',
      type: 'npc',
      ac: 14,
      maxHp: 37,
      currentHp: 37,
      initiative: 12,
      position: { x: 7, y: 2 },
      movement: 50,
      equipment: ['Natural Weapons'],
      actions: ['Bite', 'Knockdown'],
      isMoving: false
    },
    {
      id: 'direwolf2',
      name: 'Direwolf',
      type: 'npc',
      ac: 14,
      maxHp: 37,
      currentHp: 37,
      initiative: 8,
      position: { x: 8, y: 3 },
      movement: 50,
      equipment: ['Natural Weapons'],
      actions: ['Bite'],
      isMoving: false
    }
  ]);

  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [selectedCombatant, setSelectedCombatant] = useState<string | null>(null);

  // Sort combatants by initiative (highest first)
  const initiativeOrder = [...combatants].sort((a, b) => b.initiative - a.initiative);
  const currentCombatant = initiativeOrder[currentTurnIndex];

  const createGrid = (): GridPosition[] => {
    const grid: GridPosition[] = [];
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const occupied = combatants.find(c => c.position.x === x && c.position.y === y)?.id;
        grid.push({ x, y, occupied });
      }
    }
    return grid;
  };

  const grid = createGrid();

  const handleMovement = (combatantId: string) => {
    setCombatants(prev => prev.map(c => 
      c.id === combatantId ? { ...c, isMoving: !c.isMoving } : { ...c, isMoving: false }
    ));
  };

  const moveToPosition = (x: number, y: number) => {
    if (!currentCombatant.isMoving) return;
    
    const distance = Math.abs(currentCombatant.position.x - x) + Math.abs(currentCombatant.position.y - y);
    const maxTiles = Math.floor(currentCombatant.movement / 5);
    
    if (distance <= maxTiles && !grid.find(g => g.x === x && g.y === y && g.occupied)) {
      setCombatants(prev => prev.map(c => 
        c.id === currentCombatant.id 
          ? { ...c, position: { x, y }, isMoving: false }
          : c
      ));
    }
  };

  const nextTurn = () => {
    setCurrentTurnIndex((prev) => (prev + 1) % initiativeOrder.length);
    setCombatants(prev => prev.map(c => ({ ...c, isMoving: false })));
  };

  const CombatantCard: React.FC<{ combatant: Combatant; isCurrentTurn: boolean }> = ({ combatant, isCurrentTurn }) => (
    <Card className={`mb-4 ${isCurrentTurn ? 'ring-2 ring-gold border-gold bg-gold/10' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          {combatant.name}
          <Badge variant={combatant.type === 'player' ? 'default' : 'destructive'}>
            Initiative: {combatant.initiative}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>AC: {combatant.ac}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>HP: {combatant.currentHp}/{combatant.maxHp}</span>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-1">Equipment:</h4>
          <div className="flex flex-wrap gap-1">
            {combatant.equipment.map((item, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">{item}</Badge>
            ))}
          </div>
        </div>
        
        {isCurrentTurn && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Actions:</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={combatant.isMoving ? "default" : "outline"}
                onClick={() => handleMovement(combatant.id)}
                className="flex items-center gap-1"
              >
                <Move className="h-3 w-3" />
                Move ({Math.floor(combatant.movement / 5)} tiles)
              </Button>
              {combatant.actions.map((action, idx) => (
                <Button key={idx} size="sm" variant="outline">
                  <Sword className="h-3 w-3 mr-1" />
                  {action}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-wood p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-cinzel font-bold text-parchment mb-2">Combat Arena</h1>
          <div className="flex justify-center items-center gap-4">
            <Badge variant="default" className="text-lg px-4 py-2">
              Turn: {currentCombatant.name} (Initiative: {currentCombatant.initiative})
            </Badge>
            <Button onClick={nextTurn} variant="outline">
              Next Turn
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Side - Player Cards */}
          <div className="col-span-3 space-y-4">
            <h2 className="text-xl font-cinzel font-semibold text-parchment mb-4">Players</h2>
            {initiativeOrder.filter(c => c.type === 'player').map(combatant => (
              <CombatantCard 
                key={combatant.id} 
                combatant={combatant} 
                isCurrentTurn={combatant.id === currentCombatant.id}
              />
            ))}
          </div>

          {/* Middle - Combat Grid */}
          <div className="col-span-6">
            <h2 className="text-xl font-cinzel font-semibold text-parchment mb-4 text-center">Arena (10x10 Grid)</h2>
            <div className="bg-wood-light/30 p-4 rounded-lg border-2 border-copper">
              <div className="grid grid-cols-10 gap-1 aspect-square max-w-lg mx-auto">
                {grid.map((cell, idx) => {
                  const combatant = combatants.find(c => c.position.x === cell.x && c.position.y === cell.y);
                  const isValidMove = currentCombatant.isMoving && 
                    Math.abs(currentCombatant.position.x - cell.x) + Math.abs(currentCombatant.position.y - cell.y) <= Math.floor(currentCombatant.movement / 5) &&
                    !cell.occupied;
                  
                  return (
                    <div
                      key={idx}
                      className={`
                        aspect-square border border-copper/50 flex items-center justify-center text-xs font-bold cursor-pointer
                        ${combatant ? (combatant.type === 'player' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white') : 'bg-parchment/20'}
                        ${isValidMove ? 'bg-green-400/50 hover:bg-green-400/70' : ''}
                        ${currentCombatant.isMoving && !isValidMove && !combatant ? 'bg-red-400/20' : ''}
                      `}
                      onClick={() => moveToPosition(cell.x, cell.y)}
                    >
                      {combatant ? combatant.name.slice(0, 2) : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - NPC Cards */}
          <div className="col-span-3 space-y-4">
            <h2 className="text-xl font-cinzel font-semibold text-parchment mb-4">Enemies</h2>
            {initiativeOrder.filter(c => c.type === 'npc').map(combatant => (
              <CombatantCard 
                key={combatant.id} 
                combatant={combatant} 
                isCurrentTurn={combatant.id === currentCombatant.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatPage;