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
import { Antenna } from "./Antenna";
import { addAntenna, hasBuildingAt, type City } from "./city";

const TILE_SIZE = 300;
const playerOffset = -15;

export class GameMap extends Container {
	player: Player;
	startLevel: (i: number, j: number) => void;
	antennas: (Antenna | undefined)[][] = [];
	city: City;

	constructor(
		options: ViewContainerOptions & {
			city: City;
			startLevel: (i: number, j: number) => void;
		},
	) {
		super(options);
		this.startLevel = options.startLevel;
		this.city = options.city;
		const city = this.city;

		city.map.forEach((row, i) => {
			row.forEach((v, j) => {
				if (!v) {
					return;
				}
				const hasLeft = j > 0 && city.map[i][j - 1];
				const hasRight =
					j < city.map[i].length - 1 && city.map[i][j + 1];
				const hasUp = i > 0 && city.map[i - 1][j];
				const hasDown = i < city.map.length - 1 && city.map[i + 1][j];

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
				y: TILE_SIZE * 4 + playerOffset,
				angle: 90,
			}),
		);

		city.map.forEach((row, j) => {
			row.forEach((_, i) => {
				if (hasBuildingAt(city, i, j)) {
					this.addChild(
						new Building({
							x: i * TILE_SIZE - TILE_SIZE / 2,
							y: j * TILE_SIZE - TILE_SIZE / 2,
						}),
					);
				}
			});
		});

		this.antennas = city.map.map((row, i) =>
			row.map((data, j) => {
				if (data.antenna) {
					return this.addChild(
						new Antenna({
							x: j * TILE_SIZE - TILE_SIZE / 2,
							y: i * TILE_SIZE - TILE_SIZE / 2,
						}),
					);
				} else {
					return undefined;
				}
			}),
		);
	}

	update(ticker: Ticker) {
		for (const child of this.children) {
			child.update?.(ticker);
		}
		if (!this.isPressed) {
			this.inertiaX *= Math.pow(1 / 4, ticker.deltaMS / 1000);
			this.inertiaY *= Math.pow(1 / 4, ticker.deltaMS / 1000);
			this.dragMapBy(
				this.inertiaX * ticker.deltaMS,
				this.inertiaY * ticker.deltaMS,
			);
		}
	}

	dragMapBy(dx: number, dy: number) {
		const width = 1080;
		const height = 1920;
		const angle = (10 / 180) * Math.PI;
		const padding = TILE_SIZE / 4;
		const cityWidth = (this.city.map[0].length - 1) * TILE_SIZE;
		const cityHeight = (this.city.map.length - 1) * TILE_SIZE;

		this.x += dx;
		this.x = Math.min(
			Math.max(
				this.x,
				width / 2 -
					cityWidth * Math.sqrt(2) * Math.cos(Math.PI / 4 - angle) -
					padding,
			),
			-width / 2 + padding,
		);

		this.y += dy;
		this.y = Math.min(
			Math.max(
				this.y,
				height / 2 - cityHeight * Math.cos(angle) - padding,
			),
			-height / 2 + padding + cityHeight * Math.sin(angle),
		);
	}

	isPressed = false;
	previousPoint = new Point();
	previousParent = new Point();
	benchTime = 0;
	benchPosition = new Point();
	deltaX = 0;
	deltaY = 0;
	inertiaX = 0;
	inertiaY = 0;
	movedBy = 0;
	onpointerdown = (event: FederatedPointerEvent) => {
		this.isPressed = true;
		this.movedBy = 0;
		this.previousPoint = event.getLocalPosition(this);
		this.previousParent = event.getLocalPosition(this.parent!);
		this.benchTime = performance.now();
		this.benchPosition = event.getLocalPosition(this.parent!);
		this.deltaX = 0;
		this.deltaY = 0;
		this.inertiaX = 0;
		this.inertiaY = 0;
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

		if (performance.now() - this.benchTime > 20) {
			const newBenchPosition = event.getLocalPosition(this.parent!);
			this.inertiaX =
				(newBenchPosition.x - this.benchPosition.x) /
				(performance.now() - this.benchTime);
			this.inertiaY =
				(newBenchPosition.y - this.benchPosition.y) /
				(performance.now() - this.benchTime);
			this.benchTime = performance.now();
			this.benchPosition = newBenchPosition;
		}

		const newParentPos = event.getLocalPosition(this.parent!);
		const dx = newParentPos.x - this.previousParent.x;
		const dy = newParentPos.y - this.previousParent.y;
		this.previousParent = newParentPos;

		const oldX = this.x;
		const oldY = this.y;
		this.dragMapBy(dx + this.deltaX, dy + this.deltaY);
		const actualMovementX = this.x - oldX;
		this.deltaX += dx - actualMovementX;
		const actualMovementY = this.y - oldY;
		this.deltaY += dy - actualMovementY;
	};

	onpointerup = (this.onpointerupoutside = () => {
		this.isPressed = false;
		if (this.movedBy < MOVED_BY_THRESHOLD) {
			const clickedX = this.previousPoint.x;
			const clickedY = this.previousPoint.y;
			const buildingI = Math.floor(clickedY / TILE_SIZE) + 1;
			const buildingJ = Math.floor(clickedX / TILE_SIZE) + 1;
			const buildingPosition = new Point(
				buildingJ * TILE_SIZE - TILE_SIZE / 2,
				buildingI * TILE_SIZE - TILE_SIZE / 2,
			);
			if (
				buildingPosition.subtract(this.previousPoint).magnitude() >
				TILE_SIZE / 2
			) {
				return;
			}
			if (!hasBuildingAt(this.city, buildingI, buildingJ)) {
				return;
			}
			this.player.targetPosition = buildingPosition;
			this.player.targetPosition.y += TILE_SIZE / 2 + playerOffset;
			this.player.onReachedTarget = () => {
				if (
					this.city.map[buildingI][buildingJ].antenna &&
					!this.city.map[buildingI][buildingJ].antenna.isSolved
				) {
					this.startLevel(buildingI, buildingJ);
				}
				this.player.onReachedTarget = undefined;
			};
		}
		this.movedBy = 0;
	});

	solvedAntennas = 0;
	antennaSolved(i: number, j: number) {
		const antenna = this.antennas[i][j];
		antenna?.turnOff();
		this.city.map[i][j].antenna!.isSolved = true;

		this.solvedAntennas++;
		const newPos = addAntenna(this.city);
		if (!newPos) {
			return;
		}
		this.antennas[newPos.i][newPos.j] = this.addChild(
			new Antenna({
				x: newPos.j * TILE_SIZE - TILE_SIZE / 2,
				y: newPos.i * TILE_SIZE - TILE_SIZE / 2,
			}),
		);
	}
}

const MOVED_BY_THRESHOLD = 10;
