import {
	Point,
	Ticker,
	type FederatedPointerEvent,
	type ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { Tile } from "./Tile";
import { Player } from "./Player";
import { Building } from "./Building";
import { Game } from "../gameScreen/Game";
import { level1 } from "../gameScreen/levels";

const TILE_SIZE = 300;

export class GameMap extends Container {
	game?: Game;
	player: Player;
	level = level1;
	startLevel: () => void;

	constructor(options: ViewContainerOptions & { startLevel: () => void }) {
		super(options);
		this.startLevel = options.startLevel;
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

		this.player = this.addChild(
			new Player({
				x: TILE_SIZE / 2,
				angle: 90,
			}),
		);

		for (let i = -3; i <= 3; i++) {
			for (let j = -3; j <= 3; j++) {
				this.addChild(
					new Building({
						x: i * TILE_SIZE + TILE_SIZE / 2,
						y: j * TILE_SIZE + TILE_SIZE / 2,
					}),
				);
			}
		}
	}

	update(ticker: Ticker) {
		this.player.update(ticker);
		this.game?.update(ticker);
	}

	isPressed = false;
	previousPoint = new Point();
	movedBy = 0;
	onpointerdown = (event: FederatedPointerEvent) => {
		this.isPressed = true;
		this.movedBy = 0;
		this.previousPoint = event.getLocalPosition(this);
	};

	onglobalpointermove = (event: FederatedPointerEvent) => {
		if (!this.isPressed) {
			return;
		}
		this.movedBy += Math.sqrt(
			event.movementX * event.movementX +
				event.movementY * event.movementY,
		);
		if (this.movedBy < MOVED_BY_THRESHOLD) {
			return;
		}
		this.x += event.movementX;
		this.y += event.movementY;
	};

	onpointerup = () => {
		this.isPressed = false;
		if (this.movedBy < MOVED_BY_THRESHOLD) {
			const clickedX = this.previousPoint.x;
			const clickedY = this.previousPoint.y;
			const buildingPosition = new Point(
				Math.floor(clickedX / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2,
				Math.floor(clickedY / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2,
			);
			if (
				buildingPosition.subtract(this.previousPoint).magnitude() >
				TILE_SIZE / 2
			) {
				return;
			}
			this.player.targetPosition = buildingPosition;
			this.player.targetPosition.y += TILE_SIZE / 2;
			this.player.onReachedTarget = () => {
				this.startLevel();
				this.player.onReachedTarget = undefined;
			};
		}
		this.movedBy = 0;
	};
}

const MOVED_BY_THRESHOLD = 10;
