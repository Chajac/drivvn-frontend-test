import { Matches } from "@/interfaces/CardInterfaces";

interface Props {
	matchCounts: Matches;
}
const FinalMatchedValues: React.FC<Props> = ({ matchCounts }) => {
	return (
		<div
			className="flex flex-col space-y-3"
			data-testid="final-matched-values"
		>
			<span>Value Matches: {matchCounts.values}</span>
			<span>Suit Matches: {matchCounts.suits}</span>
		</div>
	);
};

export default FinalMatchedValues;
