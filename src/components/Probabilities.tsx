import { Matches } from "@/interfaces/CardInterfaces";

interface Props {
	matchCounts: Matches;
	remainingCards: number;
}

function calculateProbability(remainingCards: number, matchCounts: Matches) {
	const totalCards = 52;
	const totalSuits = 4;
	const totalValues = 13;

	const suitMatchesRemaining = totalCards / totalSuits - matchCounts.suits;
	const suitProbability = suitMatchesRemaining / remainingCards;

	const valueMatchesRemaining = totalCards / totalValues - matchCounts.values;
	const valueProbability = valueMatchesRemaining / remainingCards;

	const bothMatchesRemaining =
		suitMatchesRemaining + valueMatchesRemaining - remainingCards;
	const bothProbability =
		bothMatchesRemaining > 0 ? bothMatchesRemaining / remainingCards : 0;

	const combinedProbability =
		suitProbability + valueProbability - bothProbability;

	return Math.max(0, Math.min(1, combinedProbability));
}

const Probabilities: React.FC<Props> = ({ remainingCards, matchCounts }) => {
	const totalRemaining = remainingCards;

	return (
		<div className="flex flex-col space-y-3">
			<span>{totalRemaining} Cards remaining</span>
			<span>
				Total Match Probability:{" "}
				{(
					calculateProbability(remainingCards, matchCounts) * 100
				).toFixed(2)}
				%
			</span>
		</div>
	);
};

export default Probabilities;
