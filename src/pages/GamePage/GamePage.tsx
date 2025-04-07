import Apps from "@/components/GamePage/Apps/Apps.tsx";
import SimpleColorPicker from "@/components/GamePage/ColorPicker/SimpleColorPicker.tsx";
import {type Alert, type Coordinate, getZoomLevel, type Interaction, type QueueItem,} from "@pixelaw/core";

import {InteractionDialog, usePixelawProvider} from "@pixelaw/react";
import {useEffect, useMemo, useRef, useState} from "react";
import styles from "./GamePage.module.css";
import type {SimplePixelError} from "../../../../pixelaw.js/packages/core/src"; // biome-ignore lint/complexity/noBannedTypes: TODO

// biome-ignore lint/complexity/noBannedTypes: TODO
function debounce(func: Function, wait: number) {
	let timeout: NodeJS.Timeout;
	const debouncedFunction = (...args: any[]) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
	debouncedFunction.cancel = () => clearTimeout(timeout);
	return debouncedFunction;
}

const GamePage: React.FC = () => {
	// TODO: Ideally pixelawCore doesnt need to be exposed here, and we have a setter for renderer
	const { pixelawCore, coreStatus, world, app, color, center, zoom, setColor } =
		usePixelawProvider();
	const { viewPort: renderer } = pixelawCore;
	const rendererContainerRef = useRef<HTMLDivElement | null>(null);
	const [currentInteraction, setCurrentInteraction] =
		useState<Interaction | null>(null);

	const zoombasedAdjustment = useMemo(() => {
		return ["mid", "close"].includes(getZoomLevel(zoom)) ? "1rem" : "-100%";
	}, [zoom]);

	// Updating the URL
	useEffect(() => {
		const updateURL = () => {
			const queryParams = new URLSearchParams();
			queryParams.set("app", app ?? "");
			queryParams.set("center", `${center[0]},${center[1]}`);
			queryParams.set("zoom", zoom.toString());
			queryParams.set("color", color.toString());
			queryParams.set("world", world!);
			const newSearch = `?${queryParams.toString()}`;

			if (window.location.search !== newSearch) {
				window.history.replaceState(null, "", newSearch);
			}
		};
		const debounceUpdateURL = debounce(updateURL, 300);

		try {
			debounceUpdateURL();
		} catch (e) {
			console.log(e);
		}
		return () => {
			debounceUpdateURL.cancel();
		};
	}, [app, center, zoom, color, world]);

	// Handle viewport events
	useEffect(() => {
		const handleCellClick = async (cell: Coordinate) => {
			if (getZoomLevel(pixelawCore.getZoom()) === "far") {
				console.warn("not handling cell click if zoomed out far");
				return;
			}

			const interaction = await pixelawCore.prepInteraction(cell);

			if (interaction.getUserParams().length === 0) {
				await interaction.execute();
				return;
			}

			console.log(interaction);
			setCurrentInteraction(interaction);
		};

		const handleQueueItem = (item: QueueItem) => {
			console.log("scheduled+");
			pixelawCore.executeQueueItem(item).catch(console.error);
		};

		const handleAlert = (item: Alert) => {
			console.log("ALERT", item);
		};

		const handleError = (error: SimplePixelError) => {
			console.log("handleError", error);
			if (error.coordinate) {
				pixelawCore.viewPort.startGlow(
					error.coordinate,
					2000,
					"#FF0000",
					10,
					50,
				);
			}
		};

		console.log("handling");
		pixelawCore.queue.eventEmitter.on("scheduled", handleQueueItem);
		pixelawCore.queue.retrieve().then(() => {
			//Just let it run
		});

		// pixelawCore.events.on("cellHovered", handleCellHover)
		pixelawCore.events.on("cellClicked", handleCellClick);
		pixelawCore.events.on("error", handleError);
		pixelawCore.events.on("alert", handleAlert);

		return () => {
			// pixelawCore.events.off("cellHovered", handleCellHover)
			pixelawCore.events.off("cellClicked", handleCellClick);
			pixelawCore.queue.eventEmitter.off("scheduled", handleQueueItem);
			pixelawCore.events.off("error", handleError);
			pixelawCore.events.off("alert", handleAlert);
		};
	}, [pixelawCore]);

	useEffect(() => {
		if (coreStatus !== "ready") return;

		renderer.setContainer(rendererContainerRef.current!);
	}, [coreStatus, renderer]);

	return (
		<>
			<div
				ref={rendererContainerRef}
				style={{ width: "100%", height: "100%", touchAction: "none" }}
			/>

			<div
				className={styles.colorpicker}
				style={{ bottom: zoombasedAdjustment }}
			>
				<SimpleColorPicker color={color} onColorSelect={setColor} />
			</div>

			<div className={styles.apps} style={{ left: zoombasedAdjustment }}>
				<Apps />
			</div>
			{currentInteraction && (
				<InteractionDialog
					interaction={currentInteraction}
					onSubmit={(interaction) => {
						console.log("Interaction submitted:", interaction);
						setCurrentInteraction(null); // Clear the interaction after submission
					}}
					onCancel={(interaction) => {
						console.log("Interaction cancelled:", interaction);
						setCurrentInteraction(null); // Clear the interaction after submission
					}}
				/>
			)}
		</>
	);

	//</editor-fold>
};

export default GamePage;
