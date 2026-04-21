import { Ticker, type DestroyOptions } from "pixi.js";
import { Container } from "../../PausableContainer";
import { engine } from "../../getEngine";
import { SoundButton } from "../ui/SoundButton";
import { PauseButton } from "../ui/PauseButton";
import { PausePopup } from "../pausePopup/PausePopup";
import { GameMap } from "./GameMap";
import { Device } from "../gameScreen/Device";
import { generateCity, SAVE_KEY } from "./city";
import { Onboarding } from "./Onboarding";
import { Label } from "../ui/Label";
import { levelCount, levels } from "../gameScreen/levels";

const TILE_SIZE = 300;

export class MapScreen extends Container {
	public static assetBundles = ["main"];

	gameContainer: Container;
	gameMap: GameMap;
	soundButton: SoundButton;
	ticker: Ticker;
	onboarding: Onboarding;
	city = generateCity();
	progress: Label;

	constructor() {
		super();
		this.ticker = new Ticker();

		this.gameContainer = this.addChild(new Container());
		this.gameMap = this.gameContainer.addChild(
			new GameMap({
				x: this.city.cameraPosition.x,
				y: this.city.cameraPosition.y,
				angle: -5,
				city: this.city,
				startLevel: (i: number, j: number) => this.startLevel(i, j),
				onFinishedMoving: (hasAntennaToSolve: boolean) => {
					this.onFinishedMoving(hasAntennaToSolve);
				},
			}),
		);

		this.addChild(
			new PauseButton({
				x: 60,
				y: 60,
			}),
		);
		this.soundButton = this.addChild(new SoundButton());

		this.progress = this.addChild(
			new Label({
				x: 1080 / 2,
				y: 60,
				style: {
					fontFamily: "Roboto",
					fill: "#DDD",
					fontSize: 48,
					fontWeight: "bold",
					// stroke: {
					// 	color: "#000",
					// 	width: 6,
					// },
				},
			}),
		);
		this.redrawProgress();

		this.onboarding = this.gameMap.addChild(
			new Onboarding({
				x: 6 * TILE_SIZE,
				y: 3 * TILE_SIZE,
				angle: 5,
				text: "Click/tap on the map to move around",
			}),
		);
		this.addToTicker(this.onboarding);
		if (this.city.onboardingDone.moveAround) {
			this.onboarding.visible = false;
		}

		this.addToTicker(this.gameMap);
		this.ticker.start();
	}

	onFinishedMoving(hasAntennaToSolve: boolean) {
		this.onboarding.visible = false;
		if (this.city.onboardingDone.solveLevel) {
			this.city.onboardingDone.solveMoreLevels = true;
		}
		this.city.onboardingDone.moveAround = true;
		if (hasAntennaToSolve) {
			this.city.onboardingDone.startLevel = true;
		}

		if (!this.city.onboardingDone.startLevel) {
			this.onboarding.visible = true;
			this.onboarding.x = 5.5 * TILE_SIZE;
			this.onboarding.y = 5.5 * TILE_SIZE;
			this.onboarding.setText("Click/tap on an antenna to analyze it");
		}
	}

	onMovedSlider() {
		this.city.onboardingDone.moveSlider = true;

		if (!this.city.onboardingDone.solveLevel) {
			this.onboarding.visible = true;
			this.onboarding.x = 540;
			this.onboarding.y = 550;
			this.onboarding.angle = 0;
			this.onboarding.setText(
				"Match the signal to deactivate the antenna",
			);
			// this.onboarding.darkening.visible = false;
		}
	}

	startLevel(i: number, j: number) {
		const antenna = this.city.map[i][j].antenna;
		if (!antenna) {
			throw new Error("No antenna at this location");
		}
		const device = this.addChildAt(
			new Device({
				scale: 1,
				x: 520,
				y: 1010,
				angle: 2,
				level: levels[antenna.levelIndex].level,
				targetWaveData: antenna.blueprint,
				initialWaveData: antenna.waveform,
				onEnd: (isMatch: boolean, isHinted: boolean) => {
					device.destroy();
					this.gameMap.interactive = true;
					this.onboarding.visible = false;
					if (isMatch) {
						this.gameMap.onLevelSolved(i, j);
						if (!isHinted) {
							this.city.hintsLeft++;
						}
						this.redrawProgress();
						if (!this.city.onboardingDone.solveMoreLevels) {
							this.addChild(this.onboarding);
							this.onboarding.visible = true;
							this.onboarding.x = 540;
							this.onboarding.y = 100;
							this.onboarding.angle = 0;
							this.onboarding.setText(
								"Deactivate all remaining antennas to finish the game",
							);
						}
						this.saveProgress();
					}
				},
				useHint: () => {
					if (this.city.hintsLeft > 0) {
						this.city.hintsLeft--;
						return true;
					} else {
						return false;
					}
				},
				getHintsLeft: () => this.city.hintsLeft,
				onMovedSlider: () => {
					this.onMovedSlider();
				},
			}),
			1,
		);
		this.addToTicker(device);
		this.gameMap.interactive = false;

		if (this.city.onboardingDone.moveSlider) {
			this.onMovedSlider();
		} else {
			this.addChild(this.onboarding);
			this.onboarding.x = 600;
			this.onboarding.y = 1080;
			this.onboarding.angle = 0;
			this.onboarding.setText("Use the sliders to modify the signal");
			this.onboarding.visible = true;
			// this.onboarding.darkening.visible = false;
		}
	}

	saveProgress() {
		this.city.playerPosition.x = this.gameMap.player.x;
		this.city.playerPosition.y = this.gameMap.player.y;
		this.city.cameraPosition.x = this.gameMap.x;
		this.city.cameraPosition.y = this.gameMap.y;
		localStorage.setItem(SAVE_KEY, JSON.stringify(this.city));
	}

	redrawProgress() {
		const progress = Math.floor(
			(this.city.levelsSolved / levelCount) * 100,
		);
		this.progress.text = `PROGRESS: ${progress.toFixed(0)}%`;
	}

	start() {
		this.ticker.start();
	}

	pause() {
		super.pause();
		this.ticker.stop();
	}

	resume() {
		super.resume();
		this.ticker.start();
	}

	destroy(options?: DestroyOptions) {
		this.ticker.destroy();
		super.destroy(options);
	}

	addToTicker(container: Container & { update(ticker: Ticker): void }) {
		const callback = () => container.update(this.ticker);
		this.ticker.add(callback);
		container.on("destroyed", () => {
			if (!this.destroyed) {
				this.ticker.remove(callback);
			}
		});
	}

	show() {
		// this.game.start();
	}

	blur() {
		if (!engine().navigation.currentPopup) {
			engine().navigation.presentPopup(PausePopup);
		}
	}

	isLandscape = true;
	resize(width: number, height: number) {
		super.resize(width, height);
		this.gameContainer.position.set(width / 2, height / 2);
		this.isLandscape = width > height;
		this.soundButton.resize(width, height);
	}
}
