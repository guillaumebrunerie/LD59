import { randomInt } from "../../engine/utils/random";
import { levels } from "../gameScreen/levels";
import { pickBothWaveData } from "../gameScreen/levelsUtils";
import type { CombinedWaveData } from "../gameScreen/Waveform";

export type City = {
	playerPosition: {
		x: number;
		y: number;
	};
	cameraPosition: {
		x: number;
		y: number;
	};
	map: {
		hasTile: boolean;
		antenna?: {
			levelIndex: number;
			blueprint: CombinedWaveData;
			waveform: CombinedWaveData;
			isSolved: boolean;
		};
	}[][];
	levelIndex: number;
	antennaIndex: number;
	levelsSolved: number;
	hintsLeft: number;
	onboardingDone: {
		moveAround: boolean;
		startLevel: boolean;
		moveSlider: boolean;
		solveLevel: boolean;
		solveMoreLevels: boolean;
	};
};

export const SAVE_KEY = "mixed-signals-save";
// const mapStr = `
// 0001110000
// 0111111000
// 1111111110
// 1111111111
// 1111111111
// 0111111110
// 0111111110
// 0011111110
// 0011111000
// 0000110000
// `;
export const generateCity = (): City => {
	if (localStorage.getItem(SAVE_KEY)) {
		try {
			return JSON.parse(localStorage.getItem(SAVE_KEY)!) as City;
		} catch {
			// Ignore errors
		}
	}

	const mapStr = `
000000000000
011111111110
011111111110
011111111110
011111111110
011111111110
011111111110
011111111110
011111111110
011111111110
011111111110
000000000000
`;
	const map: City["map"] = mapStr
		.trim()
		.split("\n")
		.map((row) =>
			row
				.trim()
				.split("")
				.map((v) => ({
					hasTile: v === "1",
				})),
		);
	const skipOnboarding = false;
	const city: City = {
		playerPosition: {
			x: 4 * 300 + 150,
			y: 5 * 300,
		},
		cameraPosition: {
			x: -300 * 6,
			y: -300 * 4,
		},
		map,
		levelsSolved: 0,
		levelIndex: 0,
		antennaIndex: 0,
		hintsLeft: 5,
		onboardingDone: {
			moveAround: skipOnboarding,
			startLevel: skipOnboarding,
			moveSlider: skipOnboarding,
			solveLevel: skipOnboarding,
			solveMoreLevels: skipOnboarding,
		},
	};

	addAntennaAt(city, 6, 6);
	addAntennaAt(city, 4, 10);
	addAntennaAt(city, 3, 2);

	// let count = 0;
	// while (count < 3) {
	// 	addAntenna(city);
	// 	count++;
	// }

	return city;
};

const addAntennaAt = (city: City, i: number, j: number): boolean => {
	if (!hasBuildingAt(city, i, j) || city.map[i][j].antenna) {
		return false;
	}

	const { level, count } = levels[city.levelIndex];
	city.map[i][j].antenna = pickBothWaveData(level, city.levelIndex);

	city.antennaIndex++;
	if (city.antennaIndex == count) {
		city.antennaIndex = 0;
		city.levelIndex++;
	}
	return true;
};

export const addAntenna = (
	city: City,
): { i: number; j: number } | undefined => {
	if (city.levelIndex == levels.length) {
		return;
	}

	const i = randomInt(1, city.map.length - 1);
	const j = randomInt(1, city.map[0].length - 1);

	if (addAntennaAt(city, i, j)) {
		return { i, j };
	} else {
		return addAntenna(city);
	}
};

export const hasBuildingAt = (city: City, i: number, j: number) =>
	Number.isInteger(i) &&
	Number.isInteger(j) &&
	i > 0 &&
	j > 0 &&
	city.map[i][j].hasTile &&
	city.map[i - 1][j].hasTile &&
	city.map[i][j - 1].hasTile &&
	city.map[i - 1][j - 1].hasTile;
