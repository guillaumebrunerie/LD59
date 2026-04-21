import { AnimatedSprite, Assets, Ticker, type ContainerOptions } from "pixi.js";
import { Container } from "../../PausableContainer";
import { Label } from "../ui/Label";

export class Onboarding extends Container {
	hand: AnimatedSprite;
	// darkening: Container;
	text: Label;

	constructor(options: ContainerOptions & { text: string }) {
		super(options);

		// this.darkening = this.addChild(
		// 	new Container({
		// 		scale: 2,
		// 	}),
		// );
		// this.darkening.addChild(
		// 	new Sprite({
		// 		texture: Assets.get("OnboardingDarkening.png"),
		// 		anchor: 0.5,
		// 	}),
		// );
		// const assetSize = 900;
		// const desiredSize = 3000;
		// this.darkening.addChild(
		// 	new Graphics()
		// 		.rect(
		// 			-desiredSize / 2,
		// 			-desiredSize / 2,
		// 			desiredSize / 2 - assetSize / 2,
		// 			desiredSize,
		// 		)
		// 		.rect(
		// 			assetSize / 2,
		// 			-desiredSize / 2,
		// 			desiredSize / 2 - assetSize / 2,
		// 			desiredSize,
		// 		)
		// 		.rect(
		// 			-assetSize / 2,
		// 			-desiredSize / 2,
		// 			assetSize,
		// 			desiredSize / 2 - assetSize / 2,
		// 		)
		// 		.rect(
		// 			-assetSize / 2,
		// 			assetSize / 2,
		// 			assetSize,
		// 			desiredSize / 2 - assetSize / 2,
		// 		)
		// 		.fill(0x000000),
		// );
		// this.darkening.filters = [new AlphaFilter({ alpha: 0 })];

		this.hand = this.addChild(
			new AnimatedSprite({
				textures:
					Assets.get("HandPointingLoop").animations[
						"HandPointingLoop"
					],
				autoPlay: true,
				animationSpeed: 10 / 60,
				anchor: 0.5,
				x: 50,
				y: 50,
			}),
		);
		this.text = this.addChild(
			new Label({
				text: options.text,
				style: {
					fontFamily: "Roboto",
					fill: "#DDD",
					fontSize: 48,
					fontWeight: "bold",
					wordWrap: true,
					wordWrapWidth: 800,
				},
				anchor: 0.5,
				y: 300,
			}),
		);
	}

	setText(text: string) {
		this.text.text = text;
	}

	update(ticker: Ticker) {
		this.hand.update(ticker);
		// this.visible = false;
	}
}
