import { Assets, Sprite, type ViewContainerOptions } from "pixi.js";
import { Container } from "../../PausableContainer";

export class Tile extends Container {
	tileId: string;
	constructor(options: ViewContainerOptions) {
		const tileIds = [];
		for (let i = 1; i < 99; i++) {
			if (Assets.cache.has(`MapTile_${String(i).padStart(2, "0")}.png`)) {
				tileIds.push(`MapTile_${String(i).padStart(2, "0")}.png`);
			}
		}
		super();
		this.tileId = tileIds[Math.floor(Math.random() * tileIds.length)];
		this.addChild(
			new Sprite({
				...options,
				texture: Assets.get(this.tileId),
				anchor: 0.5,
			}),
		);
	}
}
