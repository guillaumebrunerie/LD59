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

// const mapStr = `
// 0001110000
// 0111111000
// 1111111110
// 1111111111
// 1111111111
// 0111111110
// 0111111110
// 0011111110
// 0011111000
// 0000110000
// `;
const mapStr = `
1111111111
1111111111
1111111111
1111111111
1111111111
1111111111
1111111111
1111111111
1111111111
1111111111
`;
const map = mapStr
	.trim()
	.split("\n")
	.map((row) =>
		row
			.trim()
			.split("")
			.map((v) => v === "1"),
	);

export class GameMap extends Container {
	game?: Game;
	player: Player;
	level = level1;
	startLevel: () => void;

	constructor(options: ViewContainerOptions & { startLevel: () => void }) {
		super(options);
		this.startLevel = options.startLevel;
		map.forEach((row, j) => {
			row.forEach((v, i) => {
				if (!v) {
					return;
				}
				const hasLeft = i > 0 && map[j][i - 1];
				const hasRight = i < map[j].length - 1 && map[j][i + 1];
				const hasUp = j > 0 && map[j - 1][i];
				const hasDown = j < map.length - 1 && map[j + 1][i];

				const neighbors =
					(hasLeft ? "1" : "0") +
					(hasRight ? "1" : "0") +
					(hasUp ? "1" : "0") +
					(hasDown ? "1" : "0");
				this.addChild(
					new Tile({
						x: i * TILE_SIZE,
						y: j * TILE_SIZE,
						neighbors,
					}),
				);
			});
		});
		this.interactive = true;

		this.player = this.addChild(
			new Player({
				x: TILE_SIZE / 2 + TILE_SIZE * 5,
				y: TILE_SIZE * 4,
				angle: 90,
			}),
		);

		map.forEach((row, j) => {
			row.forEach((v, i) => {
				if (
					v &&
					i > 0 &&
					j > 0 &&
					map[j - 1][i] &&
					map[j][i - 1] &&
					map[j - 1][i - 1]
				) {
					this.addChild(
						new Building({
							x: i * TILE_SIZE - TILE_SIZE / 2,
							y: j * TILE_SIZE - TILE_SIZE / 2,
						}),
					);
				}
			});
		});
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

	onpointerup = (this.onpointerupoutside = () => {
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
	});
}

const MOVED_BY_THRESHOLD = 10;
