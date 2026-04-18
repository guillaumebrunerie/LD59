import { Assets, Sprite } from "pixi.js";
import { Container } from "../../PausableContainer";

export class Tile extends Container {
	constructor() {
		super();
		this.addChild(new Sprite({ texture: Assets.get("MapTile_01.png") }));
	}
}
