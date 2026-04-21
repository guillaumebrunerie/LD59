import { Container } from "../../PausableContainer";
import { FancyButton } from "@pixi/ui";
import { engine } from "../../getEngine";
import { Assets, Graphics, Sprite } from "pixi.js";
import { SoundButton } from "../ui/SoundButton";
import { MapScreen } from "../mapScreen/MapScreen";

export class StartScreen extends Container {
	public static assetBundles = ["main"];

	logo: Sprite;
	startButton: FancyButton;
	soundButton: SoundButton;

	constructor() {
		super();

		this.logo = this.addChild(
			new Sprite({
				texture: Assets.get("Logo.jpg"),
			}),
		);
		this.startButton = this.addChild(
			new FancyButton({
				defaultView: Assets.get("StartButton.png"),
				anchor: 0.5,
			}),
		);
		this.startButton.on("pointertap", () => this.startGame());

		this.soundButton = this.addChild(new SoundButton());
	}

	resize(width: number, height: number) {
		super.resize(width, height);
		this.startButton.position.set(width / 2, (3 * height) / 4);
		this.soundButton.resize(width, height);
	}

	async startGame() {
		engine().audio.playMusic("Music", { volume: 0.3 });
		engine().audio.playSound("Click");
		await engine().navigation.showScreen(MapScreen);
	}

	async hide() {
		const rectangle = this.addChild(
			new Graphics().rect(0, 0, 1920, 1920).fill("black"),
		);
		rectangle.alpha = 0;
		await this.animate(rectangle, { alpha: 1 }, { duration: 0.5 });
		rectangle.destroy();
	}
}
