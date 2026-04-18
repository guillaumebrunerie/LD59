import { Container } from "../../PausableContainer";
import { Tile } from "./Tile";

const TILE_SIZE = 300;

export class GameMap extends Container {
	constructor() {
		super();
		for (let i = -5; i <= 5; i++) {
			for (let j = -5; j <= 5; j++) {
				const tile = this.addChild(new Tile());
				tile.position.set(i * TILE_SIZE, j * TILE_SIZE);
			}
		}
	}
}
