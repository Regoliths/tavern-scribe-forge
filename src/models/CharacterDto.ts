export class CharacterDto {
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
    maxHitPoints: number; // Optional for future use
    armorClass: number;
    speed: number;
    notes: string;
}

export class CharacterCreateDto {
    name: string;
    race: number;
    class: number;
    background: number;
    alignment: number;
    level: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    hitPoints: number;
    maxHitPoints: number; // Optional for future use
    armorClass: number;
    speed: number;
    notes: string;
    equipment?: EquipmentDto;
    inventory?: InventoryDto;
    actions?: ActionDto[];
}

export class EquipmentDto {
    characterId: number;
    items: ItemDto[];
    totalWeight: number;
}

export class InventoryDto {
    characterId: number;
    items: ItemDto[];
    totalWeight: number;
}

export class ItemDto {
    id: number;
    name: string;
    description: string;
    type: string;
    quantity: number;
    weight: number;
    cost: number;
}
export class ActionDto {
    id: number;
    name: string;
    description: string;
    type: string; // e.g., "attack", "spell", "ability"
    range?: string; // Optional, for spells or ranged attacks
    diceCount?: number; // Optional, for attacks or spells
    diceSize?: number; // Optional, for attacks or spells
    damageType?: string; // Optional, for attacks or spells
    attackBonus?: number; // Optional, for attacks
}