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

	speed = 1000;
	update(ticker: Ticker) {
		if (this.targetPosition.equals(this.position)) {
			return;
		}

		const tmpTargetPosition = this.targetPosition.clone();
		if (this.position.y == this.targetPosition.y) {
			// On the same horizontal line, just move horizontally
		} else if (Math.abs(this.position.x - this.targetPosition.x) == 150) {
			// On the closest vertical line, just move vertically
			tmpTargetPosition.x = this.position.x;
		} else {
			tmpTargetPosition.y = this.position.y;
			if (this.position.x > this.targetPosition.x) {
				tmpTargetPosition.x = this.targetPosition.x + 150;
			} else {
				tmpTargetPosition.x = this.targetPosition.x - 150;
			}
		}

		const direction = tmpTargetPosition.clone().subtract(this.position);
		const distance = direction.magnitude();
		const stepDistance = Math.min(
			(ticker.deltaMS / 1000) * this.speed,
			distance,
		);
		this.position = this.position.add(
			direction.normalize().multiplyScalar(stepDistance),
		);
		this.position.x = Math.round(this.position.x);
		this.position.y = Math.round(this.position.y);
		this.angle =
			Math.atan2(direction.y, direction.x) * (180 / Math.PI) + 90;
	}
}
