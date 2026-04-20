import {
	AnimatedSprite,
	Assets,
	Sprite,
	Ticker,
	type ContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { Label } from "../ui/Label";

export class Onboarding extends Container {
	hand: AnimatedSprite;
	darkening: Sprite;
	text: Label;

	constructor(options: ContainerOptions & { text: string }) {
		super(options);

		this.darkening = this.addChild(
			new Sprite({
				texture: Assets.get("OnboardingDarkening.png"),
				anchor: 0.5,
				scale: 2,
				alpha: 0.75,
			}),
		);
		this.hand = this.addChild(
			new AnimatedSprite({
				textures:
					Assets.get("HandPointingLoop").animations[
						"HandPointingLoop"
					],
				autoPlay: true,
				animationSpeed: 15 / 60,
				anchor: 0.5,
				x: 150,
				y: 150,
			}),
		);
		this.text = this.addChild(
			new Label({
				text: options.text,
				style: {
					fontFamily: "sans",
					fill: "#AAA",
					fontSize: 48,
					fontWeight: "bold",
				},
				anchor: 0.5,
				y: 400,
			}),
		);
	}

	update(ticker: Ticker) {
		this.hand.update(ticker);
	}
}
