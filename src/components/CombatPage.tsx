import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Heart, Move, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  actions: { name: string; range: number; attackBonus: number; damage: string }[];
  isMoving: boolean;
  isTargeting: boolean;
  selectedAction: string | null;
}

interface GridPosition {
  x: number;
  y: number;
  occupied?: string; // combatant id
}

const CombatPage: React.FC = () => {
  const { toast } = useToast();
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
      actions: [
        { name: 'Attack', range: 5, attackBonus: 5, damage: '1d8+3' },
        { name: 'Dodge', range: 0, attackBonus: 0, damage: '' },
        { name: 'Dash', range: 0, attackBonus: 0, damage: '' }
      ],
      isMoving: false,
      isTargeting: false,
      selectedAction: null
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
      actions: [
        { name: 'Ranged Attack', range: 150, attackBonus: 6, damage: '1d8+4' },
        { name: 'Hide', range: 0, attackBonus: 0, damage: '' },
        { name: 'Dash', range: 0, attackBonus: 0, damage: '' }
      ],
      isMoving: false,
      isTargeting: false,
      selectedAction: null
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
      actions: [
        { name: 'Bite', range: 5, attackBonus: 5, damage: '2d6+3' },
        { name: 'Knockdown', range: 5, attackBonus: 4, damage: '1d4+3' }
      ],
      isMoving: false,
      isTargeting: false,
      selectedAction: null
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
      actions: [
        { name: 'Bite', range: 5, attackBonus: 4, damage: '2d6+2' }
      ],
      isMoving: false,
      isTargeting: false,
      selectedAction: null
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
      c.id === combatantId ? { ...c, isMoving: !c.isMoving, isTargeting: false, selectedAction: null } : { ...c, isMoving: false, isTargeting: false, selectedAction: null }
    ));
  };

  const handleAction = (combatantId: string, action: { name: string; range: number; attackBonus: number; damage: string }) => {
    if (action.range === 0) {
      // Non-attack actions (Dodge, Dash, Hide)
      toast({
        title: "Action Taken",
        description: `${combatants.find(c => c.id === combatantId)?.name} used ${action.name}!`,
      });
      return;
    }
    
    setCombatants(prev => prev.map(c => 
      c.id === combatantId ? { ...c, isTargeting: !c.isTargeting, selectedAction: action.name, isMoving: false } : { ...c, isTargeting: false, selectedAction: null, isMoving: false }
    ));
  };

  const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  };

  const rollD20 = () => Math.floor(Math.random() * 20) + 1;
  
  const rollDamage = (damageString: string) => {
    // Simple damage roll parser for formats like "1d8+3" or "2d6+2"
    const match = damageString.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (!match) return 0;
    
    const numDice = parseInt(match[1]);
    const dieSize = parseInt(match[2]);
    const bonus = parseInt(match[3] || '0');
    
    let total = bonus;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * dieSize) + 1;
    }
    return total;
  };

  const attackTarget = (targetId: string) => {
    const attacker = currentCombatant;
    const target = combatants.find(c => c.id === targetId);
    const action = attacker.actions.find(a => a.name === attacker.selectedAction);
    
    if (!target || !action || !attacker.isTargeting) return;
    
    const distance = calculateDistance(attacker.position, target.position) * 5; // Convert to feet
    
    if (distance > action.range) {
      toast({
        title: "Out of Range",
        description: `Target is ${distance} feet away, but ${action.name} has a range of ${action.range} feet.`,
        variant: "destructive",
      });
      return;
    }
    
    // Roll attack
    const attackRoll = rollD20();
    const totalAttack = attackRoll + action.attackBonus;
    
    if (totalAttack >= target.ac) {
      // Hit! Roll damage
      const damage = rollDamage(action.damage);
      const newHp = Math.max(0, target.currentHp - damage);
      
      setCombatants(prev => prev.map(c => 
        c.id === targetId ? { ...c, currentHp: newHp } : 
        c.id === attacker.id ? { ...c, isTargeting: false, selectedAction: null } : c
      ));
      
      toast({
        title: "Attack Hit!",
        description: `${attacker.name}'s ${action.name} hit ${target.name} for ${damage} damage! (Rolled ${attackRoll}+${action.attackBonus}=${totalAttack} vs AC ${target.ac})`,
      });
      
      if (newHp === 0) {
        toast({
          title: "Combatant Downed!",
          description: `${target.name} has been defeated!`,
          variant: "destructive",
        });
      }
    } else {
      // Miss
      setCombatants(prev => prev.map(c => 
        c.id === attacker.id ? { ...c, isTargeting: false, selectedAction: null } : c
      ));
      
      toast({
        title: "Attack Missed",
        description: `${attacker.name}'s ${action.name} missed ${target.name}! (Rolled ${attackRoll}+${action.attackBonus}=${totalAttack} vs AC ${target.ac})`,
        variant: "destructive",
      });
    }
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
    setCombatants(prev => prev.map(c => ({ ...c, isMoving: false, isTargeting: false, selectedAction: null })));
  };

  const CombatantCard: React.FC<{ combatant: Combatant; isCurrentTurn: boolean }> = ({ combatant, isCurrentTurn }) => {
    const isDowned = combatant.currentHp === 0;
    
    return (
      <Card className={`mb-4 ${isCurrentTurn ? 'ring-2 ring-gold border-gold bg-gold/10' : ''} ${isDowned ? 'opacity-50 grayscale' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          {combatant.name} {isDowned && <Badge variant="destructive">Downed</Badge>}
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
        
        {isCurrentTurn && !isDowned && (
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
                <Button 
                  key={idx} 
                  size="sm" 
                  variant={combatant.isTargeting && combatant.selectedAction === action.name ? "default" : "outline"}
                  onClick={() => handleAction(combatant.id, action)}
                  className="flex items-center gap-1"
                >
                  {action.range > 0 ? <Target className="h-3 w-3" /> : <Sword className="h-3 w-3" />}
                  {action.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    );
  };

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

        <div className="flex justify-center items-start gap-6">
          {/* Left Side - Player Cards */}
          <div className="w-72 space-y-3">
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
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-cinzel font-semibold text-parchment mb-4">Arena (10x10 Grid)</h2>
            <div className="bg-wood-light/30 p-4 rounded-lg border-2 border-copper">
              <div className="grid grid-cols-10 gap-0.5 w-80 h-80">
                {grid.map((cell, idx) => {
                  const combatant = combatants.find(c => c.position.x === cell.x && c.position.y === cell.y);
                  const isValidMove = currentCombatant.isMoving && 
                    Math.abs(currentCombatant.position.x - cell.x) + Math.abs(currentCombatant.position.y - cell.y) <= Math.floor(currentCombatant.movement / 5) &&
                    !cell.occupied;
                  const isValidTarget = currentCombatant.isTargeting && combatant && combatant.id !== currentCombatant.id;
                  const action = currentCombatant.actions.find(a => a.name === currentCombatant.selectedAction);
                  const inRange = isValidTarget && action && calculateDistance(currentCombatant.position, { x: cell.x, y: cell.y }) * 5 <= action.range;
                  
                  return (
                    <div
                      key={idx}
                      className={`
                        w-7 h-7 border border-copper/50 flex items-center justify-center text-xs font-bold cursor-pointer
                        ${combatant ? 
                          (combatant.currentHp === 0 ? 'bg-gray-500 text-gray-300' :
                           combatant.type === 'player' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white') 
                          : 'bg-parchment/20'}
                        ${isValidMove ? 'bg-green-400/50 hover:bg-green-400/70' : ''}
                        ${isValidTarget && inRange ? 'bg-orange-400/50 hover:bg-orange-400/70 ring-2 ring-orange-400' : ''}
                        ${isValidTarget && !inRange ? 'bg-red-400/30' : ''}
                        ${currentCombatant.isMoving && !isValidMove && !combatant ? 'bg-red-400/20' : ''}
                      `}
                      onClick={() => {
                        if (isValidMove) {
                          moveToPosition(cell.x, cell.y);
                        } else if (isValidTarget && inRange && combatant) {
                          attackTarget(combatant.id);
                        }
                      }}
                    >
                      {combatant ? combatant.name.slice(0, 2) : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - NPC Cards */}
          <div className="w-72 space-y-3">
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