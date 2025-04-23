import Main from "@/Main.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import {PixelawProvider, usePixelawProvider} from "@pixelaw/react";
import {BrowserRouter} from "react-router-dom";
import {DojoEngine} from "@pixelaw/core-dojo";
import {MudEngine} from "@pixelaw/core-mud";
import {getCoreDefaultsFromUrl, getWorldForUrl} from "@/utils.ts";
import {StarknetChainProvider} from "@pixelaw/react-dojo";
import type {WorldsRegistry} from "@pixelaw/core";
import worldsRegistry from "@/config/worlds.json";

const AppContent = React.memo(() => {
	const { coreStatus } = usePixelawProvider();

	if (coreStatus === "error") {
		return <div className="error-message">Error occurred, check the logs</div>;
	}
	if (coreStatus === "initAccount") {
		return (
			<BrowserRouter>
				<StarknetChainProvider>
					<div className="loading-message">
						Pls wait 🧘 : Initializing account
					</div>
				</StarknetChainProvider>
			</BrowserRouter>
		);
	}
	if (coreStatus === "ready" || coreStatus === "readyWithoutWallet") {
        // TODO This renders many many times, due to "center" changes in GamePage

		return (
			<BrowserRouter>
				<StarknetChainProvider>
					{" "}
					<Main />
				</StarknetChainProvider>
			</BrowserRouter>
		);
	}

	return <div className="loading-message">Pls wait 🧘 : Loading</div>;
});

const App = () => {
	return (
		<PixelawProvider
			worldsRegistry={worldsRegistry as WorldsRegistry}
			world={world}
			engines={engines}
			coreDefaults={coreDefaults}
		>
			<AppContent />
		</PixelawProvider>
	);
};

const { protocol, hostname } = window.location;
const baseUrl = `${protocol}//${hostname}`;

const world = getWorldForUrl(
	worldsRegistry as WorldsRegistry,
	baseUrl,
	"local",
);

const rootElement = document.getElementById("root");

const engines = { dojo: DojoEngine, mud: MudEngine };

const coreDefaults = getCoreDefaultsFromUrl();

if (rootElement) {
	ReactDOM.createRoot(rootElement).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
} else {
	console.error("Failed to find the root element");
}
