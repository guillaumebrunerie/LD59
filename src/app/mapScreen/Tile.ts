import { Assets, Sprite, type ViewContainerOptions } from "pixi.js";
import { Container } from "../../PausableContainer";

export class Tile extends Container {
	tileId: string;
	constructor(
		options: ViewContainerOptions & {
			neighbors: string;
		},
	) {
		super();

		let tileType = "";
		let angle = 0;
		switch (options.neighbors) {
			case "1111":
				tileType = "MapTile";
				break;
			case "1110":
				tileType = "MapTileEdge";
				angle = 90;
				break;
			case "1101":
				tileType = "MapTileEdge";
				angle = -90;
				break;
			case "1011":
				tileType = "MapTileEdge";
				angle = 180;
				break;
			case "0111":
				tileType = "MapTileEdge";
				break;
			case "1010":
				tileType = "MapTileCorner";
				angle = 90;
				break;
			case "1001":
				tileType = "MapTileCorner";
				angle = 180;
				break;
			case "0110":
				tileType = "MapTileCorner";
				break;
			case "0101":
				tileType = "MapTileCorner";
				angle = -90;
				break;
			case "0000":
			case "0001":
			case "0010":
			case "0100":
			case "1000":
				tileType = "MapTileEmpty";
				break;
		}

		const tileIds = [];
		for (let i = 1; i < 99; i++) {
			if (
				Assets.cache.has(
					`${tileType}_${String(i).padStart(2, "0")}.png`,
				)
			) {
				tileIds.push(`${tileType}_${String(i).padStart(2, "0")}.png`);
			}
		}
		this.tileId = tileIds[Math.floor(Math.random() * tileIds.length)];
		this.addChild(
			new Sprite({
				...options,
				texture: Assets.get(this.tileId),
				anchor: 0.5,
				angle,
			}),
		);
	}
}
