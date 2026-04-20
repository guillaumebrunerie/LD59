import { randomInt } from "../../engine/utils/random";
import { levels } from "../gameScreen/levels";
import { pickBothWaveData, type Level } from "../gameScreen/levelsUtils";
import type { CombinedWaveData } from "../gameScreen/Waveform";

export type City = {
	map: {
		hasTile: boolean;
		antenna?: {
			level: Level;
			blueprint: CombinedWaveData;
			waveform: CombinedWaveData;
			isSolved: boolean;
		};
	}[][];
	levelIndex: number;
	antennaIndex: number;
};

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
	const city = {
		map,
		levelIndex: 0,
		antennaIndex: 0,
	};

	let count = 0;
	while (count < 3) {
		addAntenna(city);
		count++;
	}

	return city;
};

export const addAntenna = (
	city: City,
): { i: number; j: number } | undefined => {
	if (city.levelIndex == levels.length) {
		return;
	}

	const { level, count } = levels[city.levelIndex];
	const i = randomInt(1, city.map.length - 1);
	const j = randomInt(1, city.map[0].length - 1);
	if (!hasBuildingAt(city, i, j) || city.map[i][j].antenna) {
		return addAntenna(city);
	}
	city.map[i][j].antenna = pickBothWaveData(level);

	city.antennaIndex++;
	if (city.antennaIndex == count) {
		city.antennaIndex = 0;
		city.levelIndex++;
	}
	return { i, j };
};

export const hasBuildingAt = (city: City, i: number, j: number) =>
	i > 0 &&
	j > 0 &&
	city.map[i][j].hasTile &&
	city.map[i - 1][j].hasTile &&
	city.map[i][j - 1].hasTile &&
	city.map[i - 1][j - 1].hasTile;
