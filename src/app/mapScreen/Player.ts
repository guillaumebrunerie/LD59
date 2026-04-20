import {
	Assets,
	Point,
	Sprite,
	Ticker,
	type ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { mod } from "../utils/maths";

const playerOffset = -15;

export class Player extends Container {
	targetPosition: Point;
	car: Sprite;
	onMove: (dx: number, dy: number) => void;
	onReachedTarget?: () => void;

	constructor(
		options: ViewContainerOptions & {
			onMove: (dx: number, dy: number) => void;
		},
	) {
		super(options);
		this.car = this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("Car.png"),
				y: playerOffset,
				angle: 90,
			}),
		);
		this.targetPosition = this.position.clone();
		this.onMove = options.onMove;
	}

	minSpeed = 200;
	maxSpeed = 1000;
	update(ticker: Ticker) {
		if (this.targetPosition.equals(this.position)) {
			this.onReachedTarget?.();
			this.onReachedTarget = undefined;
			return;
		}

		const tmpTargetPosition = this.targetPosition.clone();
		if (
			(this.position.x == this.targetPosition.x &&
				mod(this.position.x, 300) == 0) ||
			(this.position.y == this.targetPosition.y &&
				mod(this.position.y, 300) == 0)
		) {
			// On the same line, just move there
		} else if (
			mod(this.position.x, 300) == 0 &&
			mod(this.targetPosition.y, 300) == 0
		) {
			// Go vertical then horizontal
			tmpTargetPosition.x = this.position.x;
		} else if (
			mod(this.position.y, 300) == 0 &&
			mod(this.targetPosition.x, 300) == 0
		) {
			// Go horizontal then vertical
			tmpTargetPosition.y = this.position.y;
		} else if (mod(this.position.x, 300) == 0) {
			// Weird case 1
			tmpTargetPosition.x = this.position.x;
			if (this.position.y > this.targetPosition.y) {
				tmpTargetPosition.y =
					Math.ceil(this.targetPosition.y / 300) * 300;
			} else {
				tmpTargetPosition.y =
					Math.floor(this.targetPosition.y / 300) * 300;
			}
		} else if (mod(this.position.y, 300) == 0) {
			// Weird case 2
			tmpTargetPosition.y = this.position.y;
			if (this.position.x > this.targetPosition.x) {
				tmpTargetPosition.x =
					Math.ceil(this.targetPosition.x / 300) * 300;
			} else {
				tmpTargetPosition.x =
					Math.floor(this.targetPosition.x / 300) * 300;
			}
		}

		let speed = this.maxSpeed;
		const realDistance = this.targetPosition
			.clone()
			.subtract(this.position)
			.magnitude();
		if (realDistance < 150) {
			speed =
				this.minSpeed +
				(realDistance / 150) * (this.maxSpeed - this.minSpeed);
		}

		const direction = tmpTargetPosition.clone().subtract(this.position);
		const distance = direction.magnitude();
		const stepDistance = Math.min(
			(ticker.deltaMS / 1000) * speed,
			distance,
		);
		const oldPosition = this.position.clone();
		this.position = this.position.add(
			direction.normalize().multiplyScalar(stepDistance),
		);
		this.position.x = Math.round(this.position.x);
		this.position.y = Math.round(this.position.y);
		this.car.angle =
			Math.atan2(direction.y, direction.x) * (180 / Math.PI) + 90;
		this.onMove(
			this.position.x - oldPosition.x,
			this.position.y - oldPosition.y,
		);
	}
}
