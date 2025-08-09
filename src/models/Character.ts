import {Equipment, Inventory} from "@/models/Item.ts";

export class Character {
    id: number;
    name: string;
    race: Race;
    class: Class;
    background: Background;
    alignment: Alignment;
    level: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    hitPoints: number;
    maxHitPoints: number;
    armorClass: number;
    speed: number;
    notes: string;
    initiative?: number;
    hitDice?: string;
    passivePerception?: number;
    proficiencyBonus?: number;
    equipment?: { characterId: number; items: any[]; totalWeight: number };
    inventory?: Inventory;
    actions?: Action[];
}

export class Action {
    id: number;
    name: string;
    description: string;
    type: string; // e.g., "attack", "spell", "ability"
    range?: string; // Optional, for spells or ranged attacks
    damage?: Damage; // Optional, for attacks or spells
    attackBonus?: number; // Optional, for attacks
}

export class Damage {
    damageType: string;
    diceCount: number;
    diceSides: number;
}

export enum Race {
    Human,
    Elf,
    Dwarf,
    Halfling,
    Dragonborn,
    Gnome,
    HalfElf,
    HalfOrc,
    Tiefling,
    Aasimar,
    Firbolg,
    Genasi,
    Goliath,
}

export enum Alignment
{
    "Lawful Good",
    "Neutral Good",
    "Chaotic Good",
    "Lawful Neutral",
    "True Neutral",
    "Chaotic Neutral",
    "Lawful Evil",
    "Neutral Evil",
    "Chaotic Evil"
}

export enum Class
{
    Barbarian,
    Bard,
    Cleric,
    Druid,
    Fighter,
    Monk,
    Paladin,
    Ranger,
    Rogue,
    Sorcerer,
    Warlock,
    Wizard
}

export enum Background
{
    "Acolyte",
    "Criminal",
    "Folk Hero",
    "Noble",
    "Sage",
    "Soldier",
    "Charlatan",
    "Entertainer",
    "Guild Artisan",
    "Hermit",
    "Outlander",
    "Sailor",
    "Urchin"
}