export interface LimitedItemData {
    maxStock: number;
    stock: number;
}

export interface LimitedsData {
    items: Record<string, LimitedItemData>;
}
