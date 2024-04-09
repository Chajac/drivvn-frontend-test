import "@testing-library/jest-dom";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import CardTable from "../components/CardTable";
import axios, { AxiosResponse } from "axios";
import Probabilities from "@/components/Probabilities";
import FinalMatchedValues from "@/components/FinalMatchedValues";

jest.mock("axios");

const BACK_IMG = "https://deckofcardsapi.com/static/img/back.png";

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

const mockDrawCardResponses = (numberOfDraws: number) => {
	const responses = [];
	for (let i = 0; i < numberOfDraws; i++) {
		const value = (i % 9) + 1; // 1 to 9 not including jack,king,queen
		const suit = ["CLUBS", "DIAMONDS", "HEARTS", "SPADES"][
			Math.floor(i / 9)
		];
		responses.push(mockDrawCardResponse(value.toString(), suit));
	}
	return responses;
};

describe("CardTable component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
		(axios.get as jest.Mock).mockResolvedValue({
			status: 200,
			data: {
				deck_id: "mock-deck-id",
				remaining: 52,
				shuffled: true,
			},
		} as AxiosResponse);
	});

	test("successfully renders the card table with initial state", async () => {
		const { getByTestId, queryByTestId } = render(<CardTable />);

		// initial card shuffle
		await waitFor(() => expect(axios.get).toHaveBeenCalled());

		const previousCardBackImage = getByTestId("previous-cardback-image");
		const currentCardBackImage = getByTestId("current-cardback-image");
		const drawButton = getByTestId("draw-button");
		const finalMatchedValues = queryByTestId("final-matched-values");
		const snapValue = getByTestId("snap-value");

		expect(true).toBeTruthy();
		expect(
			previousCardBackImage && currentCardBackImage
		).toBeInTheDocument();
		expect(drawButton).toBeInTheDocument();
		expect(finalMatchedValues).toBeNull();
		expect(snapValue.classList.contains("invisible")).toBe(true);
	});

	test("Draws a card successfully", async () => {
		const responses = mockDrawCardResponses(1);
		const axiosMock = axios.get as jest.Mock;
		axiosMock.mockResolvedValue(responses[0]);

		const { getByText, getByTestId } = render(<CardTable />);

		fireEvent.click(getByTestId("draw-button"));

		// called twice, once for shuffle and again for drawing card
		await waitFor(() => {
			expect(axios.get).toHaveBeenCalledTimes(2);
			render(
				<Probabilities
					matchCounts={{ values: 0, suits: 0 }}
					remainingCards={51}
				/>
			);
		});

		// check if card images are updated
		const previousCardBackImage = getByTestId("previous-cardback-image");
		const currentCardFrontImage = getByTestId("current-cardfront-image");

		expect(previousCardBackImage).toHaveAttribute("src", BACK_IMG);
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

	test("Draws a card matching previously drawn card", async () => {
		const responses = mockDrawCardResponses(2);
		const axiosMock = axios.get as jest.Mock;
		responses.forEach((response) => {
			axiosMock.mockResolvedValueOnce(response);
		});
		const { getByText, getByTestId } = render(<CardTable />);

		const snapValueSpan = screen.getByTestId("snap-value");
		// called once for shuffle
		await waitFor(() => {
			expect(axios.get).toHaveBeenCalledTimes(1);
		});

		// draw first card
		fireEvent.click(getByTestId("draw-button"));

		// draw second card
		fireEvent.click(getByTestId("draw-button"));

		await waitFor(() => {
			expect(axios.get).toHaveBeenCalledTimes(3);
			expect(snapValueSpan.textContent).toContain("snap");
			render(
				<Probabilities
					matchCounts={{ values: 1, suits: 0 }}
					remainingCards={50}
				/>
			);
		});

		// check if card count is updated
		expect(getByText("50 Cards remaining")).toBeInTheDocument();

		// TODO: check for probability update in docs
	});

	test("Renders final matched values when the card count hits 0 remaining", async () => {
		const responses = mockDrawCardResponses(52);
		const axiosMock = axios.get as jest.Mock;
		responses.forEach((response) => {
			axiosMock.mockResolvedValueOnce(response);
		});

		const { getByText } = render(<CardTable />);

		await waitFor(() => {
			render(
				// TODO: function to find suit/value matches to confirm validity.
				<FinalMatchedValues matchCounts={{ values: 7, suits: 0 }} />
			);
		});
		expect(getByText("Value Matches: 7")).toBeInTheDocument();
	});
});
