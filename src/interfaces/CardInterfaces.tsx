interface ShuffledDeck {
	deck_id: string | null;
	remaining: number;
	shuffled: boolean;
}

interface CardType {
	image: string;
	value: number;
	suit: string;
}

interface Matches {
	values: number;
	suits: number;
}

export type { ShuffledDeck, CardType, Matches };
