import { randomInt } from "../../engine/utils/random";
import { pickBothWaveData, type Level } from "../gameScreen/levelsUtils";
import type { CombinedWaveData } from "../gameScreen/Waveform";

export type City = {
	hasTile: boolean;
	antenna?: {
		blueprint: CombinedWaveData;
		waveform: CombinedWaveData;
	};
}[][];

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
export const generateCity = (level: Level): City => {
	const mapStr = `
1111111111
1111111111
1111111111
1111111111
1111111111
1111111111
1111111111
1111111111
1111111111
1111111111
`;
	const map: City = mapStr
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

	let count = 0;
	while (count < 3) {
		addAntenna(map, level);
		count++;
	}

	return map;
};

export const addAntenna = (city: City, level: Level) => {
	const i = randomInt(0, city[0].length - 1);
	const j = randomInt(0, city.length - 1);
	if (!hasBuildingAt(city, i, j) || city[j][i].antenna) {
		addAntenna(city, level);
	}
	city[j][i].antenna = pickBothWaveData(level);
	return { i, j };
};

export const hasBuildingAt = (map: City, i: number, j: number) =>
	i > 0 &&
	j > 0 &&
	map[j][i].hasTile &&
	map[j - 1][i].hasTile &&
	map[j][i - 1].hasTile &&
	map[j - 1][i - 1].hasTile;
