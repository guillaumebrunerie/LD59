import { Assets, Sprite, type ViewContainerOptions } from "pixi.js";
import { Container } from "../../PausableContainer";
import { Antenna } from "./Antenna";

export class Building extends Container {
	buildingId: string;
	constructor(options: ViewContainerOptions) {
		const buildingIds = [];
		for (let i = 1; i < 99; i++) {
			if (
				Assets.cache.has(`Buildings_${String(i).padStart(2, "0")}.png`)
			) {
				buildingIds.push(`Buildings_${String(i).padStart(2, "0")}.png`);
			}
		}
		super();
		this.buildingId =
			buildingIds[Math.floor(Math.random() * buildingIds.length)];
		this.addChild(
			new Sprite({
				...options,
				texture: Assets.get(this.buildingId),
				anchor: 0.5,
			}),
		);
	}
}
