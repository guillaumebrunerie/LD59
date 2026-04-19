import { Point, Ticker, type FederatedPointerEvent } from "pixi.js";
import { Container } from "../../PausableContainer";
import { Tile } from "./Tile";
import { Player } from "./Player";

const TILE_SIZE = 300;

export class GameMap extends Container {
	player: Player;

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
		this.interactive = true;

		this.player = this.addChild(new Player({}));
	}

	update(ticker: Ticker) {
		this.player.update(ticker);
	}

	isPressed = false;
	previousPoint = new Point();
	onpointerdown = (event: FederatedPointerEvent) => {
		this.isPressed = true;
		this.previousPoint = event.getLocalPosition(this);
		this.player.targetPosition = this.previousPoint.clone();
	};

	onglobalpointermove = (event: FederatedPointerEvent) => {
		if (!this.isPressed) {
			return;
		}
		this.x += event.movementX;
		this.y += event.movementY;
		// const newPoint = event.getLocalPosition(this);
		// console.log("BEFORE", newPoint);
		// const deltaX = newPoint.x - this.previousPoint.x;
		// const deltaY = newPoint.y - this.previousPoint.y;
		// // this.previousPoint = newPoint;
		// this.x += deltaX;
		// this.y += deltaY;
		// console.log("AFTER", event.getLocalPosition(this));
		// console.log(newPoint, deltaX, deltaY);
	};

	onpointerup = (this.onpointerupoutside = () => {
		this.isPressed = false;
	});
}
