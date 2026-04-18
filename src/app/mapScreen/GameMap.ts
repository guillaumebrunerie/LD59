import { Container } from "../../PausableContainer";
import { Tile } from "./Tile";

const TILE_SIZE = 300;

export class GameMap extends Container {
	constructor() {
		super();
		for (let i = -3; i <= 3; i++) {
			for (let j = -3; j <= 3; j++) {
				this.addChild(
					new Tile({
						x: i * TILE_SIZE,
						y: j * TILE_SIZE,
					}),
				);
			}
		}
	}
}
