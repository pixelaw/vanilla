import type React from "react";
import styles from "./SimpleColorPicker.module.css";
import {hexRGBtoNumber, numberToHexRGB} from "@/utils.ts";

export interface ColorPickerProps {
	onColorSelect: (color: number) => void;
	color: number;
}

const SimpleColorPicker: React.FC<ColorPickerProps> = ({
	onColorSelect,
	color: selectedColor,
}) => {
	const selectedColorHex = numberToHexRGB(selectedColor);

	return (
		<div className={styles.inner} style={{ backgroundColor: selectedColorHex }}>
			<label className={styles.button}>
				<span role="img" aria-label="palette">
					🎨
				</span>
				<input
					type="color"
					value={selectedColorHex}
					onChange={(e) => onColorSelect(hexRGBtoNumber(e.target.value))}
					aria-label="Select color"
					style={{ display: "none" }}
				/>
			</label>
		</div>
	);
};

export default SimpleColorPicker;
