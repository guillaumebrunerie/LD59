import {
	Assets,
	Point,
	Sprite,
	Ticker,
	type ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";

export class Player extends Container {
	targetPosition: Point;

	constructor(options: ViewContainerOptions) {
		super(options);
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("Car.png"),
			}),
		);
		this.targetPosition = this.position.clone();
	}

	speed = 500;
	update(ticker: Ticker) {
		if (this.targetPosition.equals(this.position)) {
			return;
		}
		const direction = this.targetPosition.clone().subtract(this.position);
		const distance = direction.magnitude();
		const stepDistance = Math.min(
			(ticker.deltaMS / 1000) * this.speed,
			distance,
		);
		this.position = this.position.add(
			direction.normalize().multiplyScalar(stepDistance),
		);
		this.angle =
			Math.atan2(direction.y, direction.x) * (180 / Math.PI) + 90;
	}
}
