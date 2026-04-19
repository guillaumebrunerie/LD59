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

	map.forEach((row, j) =>
		row.forEach((data, i) => {
			if (hasBuildingAt(map, i, j) && Math.random() < 0.2) {
				data.antenna = pickBothWaveData(level);
			}
		}),
	);

	return map;
};

export const hasBuildingAt = (map: City, i: number, j: number) =>
	i > 0 &&
	j > 0 &&
	map[j][i].hasTile &&
	map[j - 1][i].hasTile &&
	map[j][i - 1].hasTile &&
	map[j - 1][i - 1].hasTile;
