export class Item {
    id: number;
    name: string;
    description: string;
    type: string;
    quantity: number;
    weight: number;
    cost: number;
    damageDice?: string;
    damageType?: string;
    armorClass?: number;
    acBonus?: number;
    armorType?: string;
}

export class Equipment {
    id: number;
    characterId: number;
    items: Item[];
    totalWeight: number;
}

export class Inventory {
    id: number;
    characterId: number;
    items: Item[];
    totalWeight: number;
}