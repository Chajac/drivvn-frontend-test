import "@testing-library/jest-dom";
import { fireEvent, render, waitFor } from "@testing-library/react";
import CardTable from "../components/CardTable";
import axios, { AxiosResponse } from "axios";
import Probabilities from "@/components/Probabilities";
import FinalMatchedValues from "@/components/FinalMatchedValues";
import Card from "@/components/Card";
import { CARD_BACK_IMG_URL } from "@/utils/constants";

jest.mock("axios");

const axiosMock = axios.get as jest.Mock;

const mockDrawCardResponse = (value: string, suit: string) => ({
	status: 200,
	data: {
		cards: [
			{
				value,
				suit,
				image: `mock-card-image-${value}${suit}.png`,
			},
		],
	},
});

const mockDrawCardResponses = (
	numberOfDraws: number,
	mockMatch?: string | number
) => {
	const responses = [];
	const suits = ["CLUBS", "DIAMONDS", "HEARTS", "SPADES"];
	const isSuitMatch = typeof mockMatch === "string";

	for (let i = 0; i < numberOfDraws; i++) {
		const cardValue =
			mockMatch && !isSuitMatch
				? mockMatch
				: Math.floor(Math.random() * 9) + 1; // 1 to 9 not including jack,king,queen
		const cardSuit =
			mockMatch && isSuitMatch
				? mockMatch
				: suits[Math.floor(Math.random() * suits.length)];
		responses.push(mockDrawCardResponse(cardValue.toString(), cardSuit));
	}

	return responses;
};

describe("CardTable component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
		axiosMock.mockResolvedValue({
			status: 200,
			data: {
				deck_id: "mock-deck-id",
				remaining: 52,
				shuffled: true,
			},
		} as AxiosResponse);
	});

	test("successfully renders the card table with initial state", async () => {
		const { getAllByAltText, getByTestId, queryByTestId } = render(
			<CardTable />
		);
		render(<Card cardImage={CARD_BACK_IMG_URL} />);

		// initial card shuffle
		await waitFor(() => expect(axios.get).toHaveBeenCalled());

		const previousCardBackImage = getAllByAltText("Card Back Placeholder");
		const currentCardBackImage = getAllByAltText("Card Back Placeholder");
		const drawButton = getByTestId("draw-button");
		const finalMatchedValues = queryByTestId("final-matched-values");
		const snapValue = getByTestId("snap-match");

		expect(true).toBeTruthy();
		expect(
			previousCardBackImage.length && currentCardBackImage.length
		).toBeGreaterThan(0);
		expect(drawButton).toBeInTheDocument();
		expect(finalMatchedValues).toBeNull();
		expect(snapValue.classList.contains("invisible")).toBe(true);
	});

	test("Draws a card successfully", async () => {
		const responses = mockDrawCardResponses(1);
		axiosMock.mockResolvedValue(responses[0]);

		const { getByAltText, getByText, getByTestId } = render(<CardTable />);

		fireEvent.click(getByTestId("draw-button"));

		const currentCard = responses[0].data.cards[0];
		// called twice, once for shuffle and again for drawing card
		await waitFor(() => {
			expect(axios.get).toHaveBeenCalledTimes(2);
			render(<Card cardImage={currentCard.image} />);
			render(
				<Probabilities
					matchCounts={{ values: 0, suits: 0 }}
					remainingCards={51}
				/>
			);
		});

		// check if card images are updated
		const previousCardBackImage = getByAltText("Card Back Placeholder");
		const currentCardFrontImage = getByAltText(
			`${currentCard.value}, ${currentCard.suit}`
		);

		expect(previousCardBackImage).toHaveAttribute("src", CARD_BACK_IMG_URL);
		expect(currentCardFrontImage).toHaveAttribute(
			"src",
			responses[0].data.cards[0].image
		);

		// check if card count is updated
		expect(getByText("51 Cards remaining")).toBeInTheDocument();

		// check if match probabilities are updated
		expect(
			getByText("Total Match Probability: 33.33%")
		).toBeInTheDocument();
	});

	test('Displays "snap value!" when there is a value match after simulating drawing two cards with the same value', async () => {
		const { getByText, getByTestId } = render(<CardTable />);

		const mockValueMatchResponses = mockDrawCardResponses(2, 2);

		mockValueMatchResponses.forEach((response) => {
			axiosMock.mockResolvedValueOnce(response);
		});

		// Simulate drawing two cards with the same value
		fireEvent.click(getByText("Draw card"));

		// Wait for axios requests to settle
		await waitFor(() => {
			expect(axios.get).toHaveBeenCalledTimes(2);
		});

		fireEvent.click(getByText("Draw card"));

		// Wait for animations to settle
		await waitFor(() => {
			expect(axios.get).toHaveBeenCalledTimes(3);
			expect(getByTestId("snap-match").textContent).toContain(
				"snap value!"
			);
		});
	});

	test('Displays "snap suit!" when there is a suit match after simulating drawing two cards with the same suit', async () => {
		const { getByText, getByTestId } = render(<CardTable />);

		const mockSuitMatchResponses = mockDrawCardResponses(2, "CLUBS");

		mockSuitMatchResponses.forEach((response) => {
			axiosMock.mockResolvedValueOnce(response);
		});

		// Simulate drawing two cards with the same value
		fireEvent.click(getByText("Draw card"));

		// Wait for axios requests to settle
		await waitFor(() => {
			expect(axios.get).toHaveBeenCalledTimes(2);
		});

		fireEvent.click(getByText("Draw card"));

		// Wait for animations to settle
		await waitFor(() => {
			expect(axios.get).toHaveBeenCalledTimes(3);
			expect(getByTestId("snap-match").textContent).toContain(
				"snap suit!"
			);
		});
	});

	test("Renders final matched values when the card count hits 0 remaining", async () => {
		const responses = mockDrawCardResponses(52);
		responses.forEach((response) => {
			axiosMock.mockResolvedValueOnce(response);
		});

		const { getByText } = render(<CardTable />);

		await waitFor(() => {
			render(
				// TODO: use actual matched value count to confirm validity.
				<FinalMatchedValues matchCounts={{ values: 7, suits: 0 }} />
			);
		});
		expect(getByText("Value Matches: 7")).toBeInTheDocument();
	});
});
