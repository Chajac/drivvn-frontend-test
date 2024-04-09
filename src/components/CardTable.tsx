import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ShuffledDeck, CardType, Matches } from "../interfaces/CardInterfaces";
import axios from "axios";
import Probabilities from "./Probabilities";
import FinalMatchedValues from "./FinalMatchedValues";
import Card from "./Card";
import {
	CARD_BACK_IMG_URL,
	DECK_URL,
	NEW_DECK_SHUFFLED_URL,
} from "@/utils/constants";

const CardTable = () => {
	const [initialDeck, setInitialDeck] = useState<ShuffledDeck>({
		deck_id: null,
		remaining: 0,
		shuffled: false,
	});
	const [cardCount, setCardCount] = useState<number>(0);
	const [currentCard, setCurrentCard] = useState<CardType | null>(null);
	const [drawnCardTrigger, setDrawnCardTrigger] = useState<boolean>(false);
	const [previousCard, setPreviousCard] = useState<CardType | null>(null);
	const [remainingCard, setRemainingCards] = useState<number>(52);
	const [matchCounts, setMatchCounts] = useState<Matches>({
		values: 0,
		suits: 0,
	});
	const [currentMatchType, setCurrentMatchType] = useState<
		"value" | "suit" | null
	>(null);
	const { toast } = useToast();

	const shuffleDeckAndInitRef = useRef<() => Promise<void>>();

	shuffleDeckAndInitRef.current = async () => {
		const url = `${NEW_DECK_SHUFFLED_URL}/?deck_count=1`;
		return axios
			.get(url)
			.then((res) => {
				if (res.status === 200) {
					const { deck_id, remaining, shuffled } = res.data;
					setInitialDeck({ deck_id, remaining, shuffled });
				}
			})
			.catch((error) => {
				toast({
					title: "Uh-oh! Something's gone wrong...",
					description: `Error initializing and shuffling the deck: ${error.message}`,
				});

				console.error(
					"Error initializing and shuffling the deck: ",
					error
				);
			});
	};

	const drawCard = () => {
		const url = `${DECK_URL}/${initialDeck.deck_id}/draw/?count=1`;
		const drawnCard = axios
			.get(url)
			.then((res) => {
				if (res.status === 200) {
					setCurrentMatchType(null);

					setPreviousCard(currentCard);

					setCurrentCard(res.data.cards[0]);
					if (cardCount < initialDeck.remaining) {
						setCardCount((prevCardCount) => prevCardCount + 1);
					}
					setRemainingCards(res.data.remaining);
					setDrawnCardTrigger(true);
					setTimeout(() => {
						// Reset the animation
						setDrawnCardTrigger(false);
					}, 350);
				}
			})
			.catch((error) => {
				toast({
					title: "Uh-oh! Something's gone wrong...",
					description: `We're having trouble dealing your cards: ${error.message}`,
				});
				console.error("Error dealing card:", error);
			});
		return drawnCard;
	};

	useEffect(() => {
		const checkForMatches = () => {
			if (!previousCard || !currentCard) {
				return;
			}

			setMatchCounts((prevMatchCounts) => {
				const updatedMatchCounts = { ...prevMatchCounts };

				if (currentCard.value === previousCard.value) {
					updatedMatchCounts.values += 1;
					setCurrentMatchType("value");
				} else if (currentCard.suit === previousCard.suit) {
					updatedMatchCounts.suits += 1;
					setCurrentMatchType("suit");
				}

				return updatedMatchCounts;
			});
		};

		checkForMatches();
	}, [currentCard, previousCard]);

	useEffect(() => {
		const shuffleDeckAndInit = async () => {
			await shuffleDeckAndInitRef.current?.();
		};
		shuffleDeckAndInit();
	}, []);

	return (
		<>
			<div className="flex flex-col justify-center items-center mb-12">
				<span
					data-testid="snap-match"
					className={`font-bold text-xl uppercase ${
						currentMatchType ? "animate-fade-in" : ""
					} ${currentMatchType ? "visible" : "invisible"}`}
				>
					snap {currentMatchType}!
				</span>
				<div className="flex flex-row justify-center lg:gap-x-48 mt-8 sm:gap-x-2">
					<div className="lg:w-64 lg:h-96 border-primary rounded-md mx-4">
						{!previousCard ? (
							<Card
								cardImage={CARD_BACK_IMG_URL}
								alt="Card Back Placeholder"
							/>
						) : (
							<Card
								cardImage={previousCard.image}
								alt={`${previousCard.value}, ${previousCard.suit}`}
								className=" z-50"
							/>
						)}
					</div>
					<div
						className={`lg:w-64 lg:h-96 border-primary rounded-md mx-4 `}
					>
						{!currentCard ? (
							<Card
								cardImage={CARD_BACK_IMG_URL}
								alt="Card Back Placeholder"
							/>
						) : (
							currentCard && (
								<div className="relative w-full h-full">
									<Card
										cardImage={currentCard.image}
										alt={`${currentCard.value}, ${currentCard.suit}`}
									/>
									{previousCard && (
										<Card
											cardImage={previousCard.image}
											alt={`${previousCard.value}, ${previousCard.suit}`}
											className={`-z-10 absolute top-0 left-0 border-primary rounded-md duration-2450 ease-in-out${
												drawnCardTrigger
													? " transition-transform transform translate-x-[-123%] md:translate-x-[-118%] lg:translate-x-[-187%]  "
													: " duration-0 transition-transform transform translate-x-[0%] lg:translate-x-[-0%]"
											}`}
										/>
									)}
								</div>
							)
						)}
					</div>
				</div>
			</div>
			<div className="flex text-transform: uppercase text-base ">
				{remainingCard === 0 ? (
					<FinalMatchedValues matchCounts={matchCounts} />
				) : (
					<div className="space-y-3">
						<Probabilities
							matchCounts={matchCounts}
							remainingCards={remainingCard}
						/>

						<Button data-testid="draw-button" onClick={drawCard}>
							Draw card
						</Button>
					</div>
				)}
			</div>
		</>
	);
};

export default CardTable;
