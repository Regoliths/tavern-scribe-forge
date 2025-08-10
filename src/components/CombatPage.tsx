import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Sword, Shield, Heart, Move, Target, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import {getCharacter} from "@/components/CharacterPage.tsx";
import {Character, Race, Class} from "@/models/Character.ts";
import {Item} from "@/models/Item.ts";
import { useMonster } from '@/hooks/useMonster';

interface Combatant {
  id: number;
  name: string;
  type: 'player' | 'npc';
  ac: number;
  maxHp: number;
  currentHp: number;
  initiative: number;
  dexterityModifier: number;
  position: { x: number; y: number };
  movement: number;
  movementUsed: number;
  equipment: string[];
  actions: { name: string; range: number; attackBonus: number; damage: string }[];
  isMoving: boolean;
  isTargeting: boolean;
  selectedAction: string | null;
  hasActedThisTurn: boolean;
  reactionUsed: boolean;
}

// Monster combatant interface (no longer extends Combatant)
interface MonsterCombatant {
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

interface GridPosition {
  x: number;
  y: number;
  occupied?: number; // combatant id
}

const rollD20 = () => Math.floor(Math.random() * 20) + 1;
const rollInitiative = (dexModifier: number) => rollD20() + dexModifier;

const getCombantantById = async (combatantId: number, positionX: number, positionY: number): Promise<Combatant | undefined> => {
  try {
    const combatant = await getCharacter(combatantId.toString());
    const dexModifier = Math.floor((combatant.dexterity || 10 - 10) / 2);
    return {
      id: combatant.id,
      name: combatant.name,
      type: 'player',
      ac: combatant.armorClass,
      maxHp: combatant.maxHitPoints,
      currentHp: combatant.hitPoints,
      initiative: 0, // Will be rolled when combat starts
      dexterityModifier: dexModifier,
      position: {x: positionX, y: positionY},
      movement: combatant.speed, // Default movement speed
      movementUsed: 0,
      equipment: combatant.equipment?.items.map((item: Item) => item.name) || [],
      actions: combatant.actions.map(action => ({
        name: action.name,
        description: action.description,
        range: action.range ? parseInt(action.range) : 0,
        attackBonus: action.attackBonus || 0,
        damage: `${action.damage?.diceCount || 1}d${action.damage?.diceSides || 4}${action.damage?.damageType ? ` ${action.damage.damageType}` : ''}`
      })),
      isMoving: false,
      isTargeting: false,
      selectedAction: null,
      hasActedThisTurn: false,
      reactionUsed: false
    };
  } catch (error) {
    console.error("Error fetching combatant:", error);
    return undefined;
  }
}

const CombatPage: React.FC = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Character[]>([]);
  const [combatStarted, setCombatStarted] = useState(false);
  const [combatants, setCombatants] = useState<Combatant[]>([]);

  // Use the useMonster hook for enemy data
  const { monster, loading: monsterLoading, error: monsterError } = useMonster('brown-bear');
  const [monsterCombatants, setMonsterCombatants] = useState<MonsterCombatant[]>([]);

  useEffect(() => {
    if (monster) {
      setMonsterCombatants([monster]);
    }
  }, [monster]);

  // Load available players on component mount
  useEffect(() => {
    const loadAvailablePlayers = async () => {
      try {
        const players: Character[] = [];
        for (let i = 1; i <= 10; i++) {
          try {
            const player = await getCharacter(i.toString());
            if (player) {
              players.push(player);
            }
          } catch (error) {
            // Player doesn't exist, continue
          }
        }
        setAvailablePlayers(players);
      } catch (error) {
        console.error('Error loading available players:', error);
      }
    };

    loadAvailablePlayers();
  }, []);

  // Check URL params for selected players
  useEffect(() => {
    const playersParam = searchParams.get('players');
    if (playersParam) {
      const playerIds = playersParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      if (playerIds.length > 0) {
        setSelectedPlayerIds(playerIds);
        setCombatStarted(true);
        loadCombat(playerIds);
      }
    }
  }, [searchParams]);

  const loadCombat = async (playerIds: number[]) => {
    try {
      const playerCombatants: Combatant[] = [];
      for (let i = 0; i < playerIds.length; i++) {
        const playerId = playerIds[i];
        const playerCombatant = await getCombantantById(playerId, 2 + i, 1 + i);
        if (playerCombatant) {
          playerCombatants.push(playerCombatant);
        }
      }
      // Convert MonsterCombatant to Combatant for combat
      const monsterAsCombatants: Combatant[] = monsterCombatants.map((m, idx) => ({
        id: m.id,
        name: m.name,
        type: 'npc',
        ac: m.ac,
        maxHp: m.maxHp,
        currentHp: m.currentHp,
        initiative: 0,
        dexterityModifier: 0,
        position: { x: 5 + idx, y: 4 + idx },
        movement: m.movement,
        movementUsed: 0,
        equipment: [],
        actions: m.actions.map(a => ({
          name: a.name,
          range: 5, // Default range for monster actions
          attackBonus: a.attackBonus || 0,
          damage: a.damage || '',
        })),
        isMoving: false,
        isTargeting: false,
        selectedAction: null,
        hasActedThisTurn: false,
        reactionUsed: false
      }));
      // Roll initiative for all combatants
      const allCombatants = [...monsterAsCombatants, ...playerCombatants];
      allCombatants.forEach(combatant => {
        combatant.initiative = rollInitiative(combatant.dexterityModifier);
      });
      setCombatants(allCombatants);
    } catch (error) {
      console.error('Error loading combat:', error);
    }
  };

  // Reset turn index when combatants change to ensure highest initiative goes first
  useEffect(() => {
    if (combatants.length > 0) {
      setCurrentTurnIndex(0);
    }
  }, [combatants.length]);

  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

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

  const handleMovement = (combatantId: number) => {
    const combatant = combatants.find(c => c.id === combatantId);
    if (!combatant || combatant.movementUsed >= combatant.movement) return;
    
    setCombatants(prev => prev.map(c => 
      c.id === combatantId ? { ...c, isMoving: !c.isMoving, isTargeting: false, selectedAction: null } : { ...c, isMoving: false, isTargeting: false, selectedAction: null }
    ));
  };

  // Track which type of action (multiattack or not) was used this turn for each combatant
  const [multiattackTurnType, setMultiattackTurnType] = useState<{ [combatantId: number]: 'multiattack' | 'single' | null }>({});

  // Helper to check if an action is part of multiattack
  const isMultiattackAction = (combatant: Combatant, actionName: string) => {
    const monster = monsterCombatants.find(m => m.id === combatant.id);
    if (!monster || !monster.multiattack) return false;
    return monster.multiattack.attacks.some(a => a.name === actionName);
  };

  const handleAction = (combatantId: number, action: { name: string; range: number; attackBonus: number; damage: string }) => {
    const combatant = combatants.find(c => c.id === combatantId);
    if (!combatant || combatant.hasActedThisTurn) return;
    // If this is an enemy with multiattack, check restrictions
    if (combatant.type === 'npc' && canEnemyMultiattack(combatant)) {
      const isMulti = isMultiattackAction(combatant, action.name);
      // Only restrict if a multiattack or single action has already been chosen this turn
      if (multiattackTurnType[combatantId] === 'single' && isMulti) return;
      if (multiattackTurnType[combatantId] === 'multiattack' && !isMulti) return;
      // If neither has been chosen, allow any action
      if (isMulti && multiattackTurnType[combatantId] !== 'multiattack') setMultiattackTurnType(prev => ({ ...prev, [combatantId]: 'multiattack' }));
      if (!isMulti && multiattackTurnType[combatantId] !== 'single') setMultiattackTurnType(prev => ({ ...prev, [combatantId]: 'single' }));
    }
    if (action.range === 0) {
      // Non-attack actions (Dodge, Dash, Hide)
      setCombatants(prev => prev.map(c => 
        c.id === combatantId ? { ...c, hasActedThisTurn: true } : c
      ));
      toast({
        title: "Action Taken",
        description: `${combatant.name} used ${action.name}!`,
      });
      return;
    }
    
    setCombatants(prev => prev.map(c => 
      c.id === combatantId ? { ...c, isTargeting: !c.isTargeting, selectedAction: action.name, isMoving: false } : { ...c, isTargeting: false, selectedAction: null, isMoving: false }
    ));
  };

  // Multiattack logic for enemies
  const canEnemyMultiattack = (combatant: Combatant): boolean => {
    if (combatant.type !== 'npc') return false;
    const monster = monsterCombatants.find(m => m.id === combatant.id);
    return !!(monster && monster.multiattack_type === 'actions' && monster.multiattack && monster.multiattack.attacks.length > 0);
  };

  // Track multiattack state for the current enemy
  const [multiattackState, setMultiattackState] = useState<{ [combatantId: number]: { [attackName: string]: number } }>({});

  useEffect(() => {
    // Reset multiattack state at the start of each turn
    if (currentCombatant && canEnemyMultiattack(currentCombatant)) {
      const monster = monsterCombatants.find(m => m.id === currentCombatant.id);
      if (monster && monster.multiattack) {
        const attackCounts: { [attackName: string]: number } = {};
        monster.multiattack.attacks.forEach(a => {
          attackCounts[a.name] = 0;
        });
        setMultiattackState(prev => ({ ...prev, [currentCombatant.id]: attackCounts }));
      }
    }
  }, [currentCombatant?.id]);

  // Helper to get remaining multiattacks for the current enemy
  const getRemainingMultiattacks = (combatant: Combatant) => {
    const monster = monsterCombatants.find(m => m.id === combatant.id);
    if (!monster || !monster.multiattack) return {};
    const state = multiattackState[combatant.id] || {};
    const remaining: { [attackName: string]: number } = {};
    monster.multiattack.attacks.forEach(a => {
      remaining[a.name] = a.count - (state[a.name] || 0);
    });
    return remaining;
  };

  // Override handleAction for enemy multiattack
  const handleEnemyMultiattackAction = (combatantId: number, action: { name: string; range: number; attackBonus: number; damage: string }) => {
    const combatant = combatants.find(c => c.id === combatantId);
    if (!combatant || combatant.hasActedThisTurn) return;
    if (!canEnemyMultiattack(combatant)) return;
    // Only allow if this attack is still available for multiattack
    const remaining = getRemainingMultiattacks(combatant);
    if ((remaining[action.name] || 0) <= 0) return;
    // If already used a non-multiattack action, block
    if (multiattackTurnType[combatantId] === 'single') return;
    setMultiattackTurnType(prev => ({ ...prev, [combatantId]: 'multiattack' }));
    setCombatants(prev => prev.map(c =>
      c.id === combatantId ? { ...c, isTargeting: !c.isTargeting, selectedAction: action.name, isMoving: false } : { ...c, isTargeting: false, selectedAction: null, isMoving: false }
    ));
  };

  // After a successful attack, increment multiattack usage and check if all are done
  const afterEnemyAttack = (combatantId: number, actionName: string) => {
    setMultiattackState(prev => {
      const state = { ...(prev[combatantId] || {}) };
      state[actionName] = (state[actionName] || 0) + 1;
      return { ...prev, [combatantId]: state };
    });
    // Check if all multiattacks are used up
    const combatant = combatants.find(c => c.id === combatantId);
    if (!combatant) return;
    const monster = monsterCombatants.find(m => m.id === combatantId);
    if (!monster || !monster.multiattack) return;
    const state = multiattackState[combatantId] || {};
    // Calculate remaining for each attack
    let allDone = true;
    for (const atk of monster.multiattack.attacks) {
      const used = (state[atk.name] || 0) + (atk.name === actionName ? 1 : 0); // include this attack
      if (used < atk.count) {
        allDone = false;
        break;
      }
    }
    if (allDone) {
      setCombatants(prev => prev.map(c => c.id === combatantId ? { ...c, hasActedThisTurn: true, isTargeting: false, selectedAction: null } : c));
    } else {
      // Allow further attacks this turn, but clear targeting
      setCombatants(prev => prev.map(c => c.id === combatantId ? { ...c, isTargeting: false, selectedAction: null } : c));
    }
  };

  const attackTarget = (targetId: number) => {
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
        c.id === attacker.id ? { ...c, isTargeting: false, selectedAction: null, hasActedThisTurn: attacker.type === 'npc' && canEnemyMultiattack(attacker) ? c.hasActedThisTurn : true, isMoving: false } : c
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
      // Multiattack logic: only call afterEnemyAttack for monsters with multiattack
      if (attacker.type === 'npc' && canEnemyMultiattack(attacker)) {
        afterEnemyAttack(attacker.id, action.name);
      }
    } else {
      // Miss
      setCombatants(prev => prev.map(c => 
        c.id === attacker.id ? { ...c, isTargeting: false, selectedAction: null, hasActedThisTurn: attacker.type === 'npc' && canEnemyMultiattack(attacker) ? c.hasActedThisTurn : true, isMoving: false } : c
      ));
      
      toast({
        title: "Attack Missed",
        description: `${attacker.name}'s ${action.name} missed ${target.name}! (Rolled ${attackRoll}+${action.attackBonus}=${totalAttack} vs AC ${target.ac})`,
        variant: "destructive",
      });
      if (attacker.type === 'npc' && canEnemyMultiattack(attacker)) {
        afterEnemyAttack(attacker.id, action.name);
      }
    }
  };

  // Check for attacks of opportunity when moving
  const checkAttackOfOpportunity = (movingCombatant: Combatant, newPosition: { x: number; y: number }) => {
    const enemies = combatants.filter(c => 
      c.type !== movingCombatant.type && 
      c.currentHp > 0 && 
      !c.reactionUsed
    );
    
    for (const enemy of enemies) {
      const oldDistance = calculateDistance(movingCombatant.position, enemy.position);
      const newDistance = calculateDistance(newPosition, enemy.position);
      
      // If moving from adjacent (5ft) to non-adjacent, triggers AoO
      if (oldDistance === 1 && newDistance > 1) {
        const attackRoll = rollD20();
        const meleeAction = enemy.actions.find(a => a.range <= 5) || enemy.actions[0];
        const totalAttack = attackRoll + (meleeAction?.attackBonus || 0);
        
        if (totalAttack >= movingCombatant.ac) {
          const damage = rollDamage(meleeAction?.damage || '1d4');
          const newHp = Math.max(0, movingCombatant.currentHp - damage);
          
          setCombatants(prev => prev.map(c => 
            c.id === movingCombatant.id ? { ...c, currentHp: newHp } : 
            c.id === enemy.id ? { ...c, reactionUsed: true } : c
          ));
          
          toast({
            title: "Attack of Opportunity!",
            description: `${enemy.name} hits ${movingCombatant.name} for ${damage} damage as they move away!`,
            variant: "destructive",
          });
          
          return true; // Stop after first AoO
        } else {
          setCombatants(prev => prev.map(c => 
            c.id === enemy.id ? { ...c, reactionUsed: true } : c
          ));
          
          toast({
            title: "Attack of Opportunity Missed!",
            description: `${enemy.name} misses ${movingCombatant.name} as they move away!`,
          });
        }
      }
    }
    return false;
  };

  const moveToPosition = (x: number, y: number) => {
    currentCombatant.isMoving = true;
    
    const distance = Math.abs(currentCombatant.position.x - x) + Math.abs(currentCombatant.position.y - y);
    const movementCost = distance * 5; // Each square is 5 feet
    const remainingMovement = currentCombatant.movement - currentCombatant.movementUsed;
    
    if (movementCost <= remainingMovement && !grid.find(g => g.x === x && g.y === y && g.occupied)) {
      const newPosition = { x, y };
      
      // Check for attacks of opportunity before moving
      checkAttackOfOpportunity(currentCombatant, newPosition);
      
      setCombatants(prev => prev.map(c => 
        c.id === currentCombatant.id 
          ? { ...c, position: newPosition, isMoving: false, movementUsed: c.movementUsed + movementCost }
          : c
      ));
    }
  };

  const nextTurn = () => {
    setCurrentTurnIndex((prev) => (prev + 1) % initiativeOrder.length);
    setCombatants(prev => prev.map(c => ({ ...c, isMoving: false, isTargeting: false, selectedAction: null, movementUsed: 0, hasActedThisTurn: false, reactionUsed: false })));
  };

  // Check if combat should end
  const checkCombatEnd = () => {
    const alivePlayers = combatants.filter(c => c.type === 'player' && c.currentHp > 0);
    const aliveMonsters = combatants.filter(c => c.type === 'npc' && c.currentHp > 0);
    
    if (alivePlayers.length === 0) {
      return { ended: true, result: 'defeat' };
    }
    if (aliveMonsters.length === 0) {
      return { ended: true, result: 'victory' };
    }
    return { ended: false, result: null };
  };

  const combatStatus = checkCombatEnd();

  const handlePlayerSelection = (playerId: number, isSelected: boolean) => {
    if (isSelected) {
      if (selectedPlayerIds.length < 4) {
        setSelectedPlayerIds([...selectedPlayerIds, playerId]);
      }
    } else {
      setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== playerId));
    }
  };

  const startCombat = () => {
    if (selectedPlayerIds.length === 0) {
      toast({
        title: "No Players Selected",
        description: "Please select at least one player to start combat.",
        variant: "destructive",
      });
      return;
    }
    
    const playersParam = selectedPlayerIds.join(',');
    setSearchParams({ players: playersParam });
    setCombatStarted(true);
    loadCombat(selectedPlayerIds);
  };

  const resetPartySelection = () => {
    setSelectedPlayerIds([]);
    setCombatStarted(false);
    setCombatants([]);
    setSearchParams({});
  };

  // Player card for combatants
  const PlayerCombatantCard: React.FC<{ combatant: Combatant; isCurrentTurn: boolean }> = ({ combatant, isCurrentTurn }) => {
    const isDowned = combatant.currentHp === 0;
    return (
      <Card className={`mb-4 ${isCurrentTurn ? 'ring-2 ring-gold border-gold bg-gold/10' : ''} ${isDowned ? 'opacity-50 grayscale' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            {combatant.name} {isDowned && <Badge variant="destructive">Downed</Badge>}
            <Badge variant="default">Initiative: {combatant.initiative}</Badge>
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
                  disabled={combatant.movementUsed >= combatant.movement}
                >
                  <Move className="h-3 w-3" />
                  Move ({Math.floor((combatant.movement - combatant.movementUsed) / 5)} left)
                </Button>
                {combatant.actions.map((action, idx) => (
                  <Button 
                    key={idx} 
                    size="sm" 
                    variant={combatant.isTargeting && combatant.selectedAction === action.name ? "default" : "outline"}
                    onClick={() => handleAction(combatant.id, action)}
                    className="flex items-center gap-1"
                    disabled={combatant.hasActedThisTurn}
                  >
                    {action.range > 0 ? <Target className="h-3 w-3" /> : <Sword className="h-3 w-3" />}
                    {action.name} {combatant.hasActedThisTurn && '✓'}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Enemy card for combatants
  const EnemyCombatantCard: React.FC<{ combatant: Combatant; isCurrentTurn: boolean }> = ({ combatant, isCurrentTurn }) => {
    const isDowned = combatant.currentHp === 0;
    const monster = monsterCombatants.find(m => m.id === combatant.id);
    const hasMultiattack = monster?.multiattack_type === 'actions' && monster?.multiattack && monster.multiattack.attacks.length > 0;
    return (
      <Card className={`mb-4 ${isCurrentTurn ? 'ring-2 ring-red-600 border-red-600 bg-red-600/10' : ''} ${isDowned ? 'opacity-50 grayscale' : ''}`}>
        <CardHeader className="pb-2 flex flex-col items-center">
          {monster?.image && (
            <img src={monster.image} alt={combatant.name} className="w-16 h-16 object-contain mb-2 rounded-full border" />
          )}
          <CardTitle className="text-lg flex items-center justify-between w-full">
            {combatant.name} {isDowned && <Badge variant="destructive">Downed</Badge>}
            <Badge variant="destructive">Initiative: {combatant.initiative}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 flex flex-col items-center">
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
          {monster?.challenge_rating !== undefined && (
            <Badge variant="secondary">CR: {monster.challenge_rating}</Badge>
          )}
          {isCurrentTurn && !isDowned && (
            <div className="space-y-2 w-full">
              <h4 className="font-semibold text-sm">Actions:</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={combatant.isMoving ? "default" : "outline"}
                  onClick={() => handleMovement(combatant.id)}
                  className="flex items-center gap-1"
                  disabled={combatant.movementUsed >= combatant.movement}
                >
                  <Move className="h-3 w-3" />
                  Move ({Math.floor((combatant.movement - combatant.movementUsed) / 5)} left)
                </Button>
                {/* Only show attack actions, never show Multiattack as a button if multiattack is enabled */}
                {combatant.actions.filter(action => {
                  // Hide Multiattack button if multiattack logic is present
                  if (hasMultiattack && action.name.toLowerCase() === 'multiattack') return false;
                  return true;
                }).map((action, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant={combatant.isTargeting && combatant.selectedAction === action.name ? "default" : "outline"}
                    onClick={() => hasMultiattack ? handleEnemyMultiattackAction(combatant.id, action) : handleAction(combatant.id, action)}
                    className="flex items-center gap-1"
                    disabled={combatant.hasActedThisTurn || (hasMultiattack && getRemainingMultiattacks(combatant)[action.name] <= 0)}
                  >
                    {action.range > 0 ? <Target className="h-3 w-3" /> : <Sword className="h-3 w-3" />}
                    {action.name}
                    {hasMultiattack && getRemainingMultiattacks(combatant)[action.name] !== undefined && (
                      <span className="ml-1 text-xs text-orange-700">x{getRemainingMultiattacks(combatant)[action.name]}</span>
                    )}
                  </Button>
                ))}
                {/* Show multiattack info if present */}
                {hasMultiattack && (
                  <div className="w-full text-xs text-center mt-2 text-orange-700 bg-orange-100 rounded p-1">
                    Multiattack: {monster.multiattack.desc}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!combatStarted) {
    return (
      <div className="min-h-screen bg-gradient-wood p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-cinzel font-bold text-parchment mb-2">Select Your Party</h1>
            <p className="text-parchment/80">Choose 1-4 players to enter combat</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Available Players ({selectedPlayerIds.length}/4 selected)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePlayers.map((player) => (
                  <div key={player.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <Checkbox
                      checked={selectedPlayerIds.includes(player.id)}
                      onCheckedChange={(checked) => 
                        handlePlayerSelection(player.id, checked as boolean)
                      }
                      disabled={!selectedPlayerIds.includes(player.id) && selectedPlayerIds.length >= 4}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{player.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          AC: {player.armorClass}
                          <Heart className="h-3 w-3" />
                          HP: {player.hitPoints}/{player.maxHitPoints}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {Race[player.race]} {Class[player.class]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {availablePlayers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No players found. Create some characters first!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button 
              onClick={startCombat}
              disabled={selectedPlayerIds.length === 0}
              size="lg"
              className="px-8"
            >
              Start Combat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-wood p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-cinzel font-bold text-parchment mb-2">Combat Arena</h1>
          <div className="flex justify-center items-center gap-4">
            {!combatStatus.ended && (
              <>
                <Badge variant="default" className="text-lg px-4 py-2">
                  Turn: {currentCombatant?.name} (Initiative: {currentCombatant?.initiative})
                </Badge>
                <Button onClick={nextTurn} variant="outline">
                  Next Turn
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Combat End Overlay */}
        {combatStatus.ended && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader className="text-center">
                <CardTitle className={`text-3xl font-cinzel font-bold ${combatStatus.result === 'victory' ? 'text-green-600' : 'text-red-600'}`}>
                  {combatStatus.result === 'victory' ? 'Victory!' : 'Defeat!'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-lg">
                  {combatStatus.result === 'victory' 
                    ? 'All enemies have been defeated!' 
                    : 'All party members have fallen!'}
                </p>
                <Button 
                  onClick={resetPartySelection} 
                  size="lg" 
                  className="w-full"
                >
                  Return to Party Selection
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-center items-start gap-6">
          {/* Left Side - Player Cards */}
          <div className="w-72 space-y-3">
            <h2 className="text-xl font-cinzel font-semibold text-parchment mb-4">Players</h2>
            {initiativeOrder.filter(c => c.type === 'player').map(combatant => (
              <PlayerCombatantCard 
                key={combatant.id} 
                combatant={combatant} 
                isCurrentTurn={combatant.id === currentCombatant.id}
              />
            ))}
          </div>

          {/* Middle - Combat Grid */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-4 mb-4">
              <Button onClick={resetPartySelection} variant="outline" size="sm">
                ← Back to Party Selection
              </Button>
              <h2 className="text-xl font-cinzel font-semibold text-parchment">Arena (10x10 Grid)</h2>
            </div>
            <div className="bg-wood-light/30 p-4 rounded-lg border-2 border-copper">
              <div className="grid grid-cols-10 gap-1 w-[640px] h-[640px]">
                {grid.map((cell, idx) => {
                  const combatant = combatants.find(c => c.position.x === cell.x && c.position.y === cell.y);
                  const isValidMove = currentCombatant?.isMoving &&
                      Math.abs(currentCombatant.position.x - cell.x) + Math.abs(currentCombatant.position.y - cell.y) <= Math.floor((currentCombatant.movement - currentCombatant.movementUsed) / 5) && !cell.occupied;
                  const isValidTarget = currentCombatant?.isTargeting && combatant && combatant.id !== currentCombatant.id;
                  const action = currentCombatant?.actions.find(a => a.name === currentCombatant.selectedAction);
                  const inRange = isValidTarget && action && calculateDistance(currentCombatant.position, { x: cell.x, y: cell.y }) * 5 <= action.range;
                  return (
                    <div
                      key={idx}
                      className={`
                        w-[60px] h-[60px] border border-copper/50 flex items-center justify-center text-xs font-bold cursor-pointer
                        ${combatant ? 
                          (combatant.currentHp === 0 ? 'bg-gray-500 text-gray-300' :
                           combatant.type === 'player' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white') 
                          : 'bg-parchment/20'}
                        ${isValidMove ? 'bg-green-400/50 hover:bg-green-400/70' : ''}
                        ${isValidTarget && inRange ? 'bg-orange-400/50 hover:bg-orange-400/70 ring-2 ring-orange-400' : ''}
                        ${isValidTarget && !inRange ? 'bg-red-400/30' : ''}
                        ${currentCombatant?.isMoving && !isValidMove && !combatant ? 'bg-red-400/20' : ''}
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
              <EnemyCombatantCard 
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

// Utility: Calculate Manhattan distance between two grid positions
const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

// Utility: Roll damage from a dice string like "2d6+3"
const rollDamage = (damageString: string) => {
  if (!damageString) return 0;
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

export default CombatPage;
