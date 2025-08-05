export class UpdateCharacterDto {
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
    maxHitPoints: number;
    hitDice: number;
    armorClass: number;
    speed: number;
    notes: string;
    equipment: {
        characterId: number;
        totalWeight: number;
        items: {
            id: number;
            name: string;
            description: string;
            type: string;
            quantity: number;
            weight: number;
            cost: number;
        }[];
    };
    inventory: {
        characterId: number;
        totalWeight: number;
        items: {
            id: number;
            name: string;
            description: string;
            type: string;
            quantity: number;
            weight: number;
            cost: number;
        }[];
    };
    actions: {
        id: number;
        name: string;
        description: string;
        range: number;
        attackBonus: number;
        damageType: string;
        diceCount: number;
        diceSize: number;
    }[];
}