import { FancyButton } from "@pixi/ui";
import { Assets, Container, type ViewContainerOptions } from "pixi.js";
import { userSettings } from "../utils/userSettings";

export class SoundButton extends Container {
	private button: FancyButton;
	constructor(options?: ViewContainerOptions) {
		super(options);
		this.button = new FancyButton({});
		this.button.onPress.connect(() => {
			this.toggleSound();
		});
		this.updateButton();
		this.addChild(this.button);
	}

	resize(width: number, _height: number) {
		this.position.set(width - 60, 70);
	}

	isSoundOn() {
		return userSettings.masterVolume.get() > 0.5;
	}

	updateButton() {
		this.button.anchor.set(0.5);
		this.button.defaultView =
			this.isSoundOn() ?
				Assets.get("SoundOnButton.png")
			:	Assets.get("SoundOffButton.png");
	}

	prepare() {}

	toggleSound() {
		if (this.isSoundOn()) {
			userSettings.masterVolume.set(0);
		} else {
			userSettings.masterVolume.set(1);
		}
		this.updateButton();
	}
}
