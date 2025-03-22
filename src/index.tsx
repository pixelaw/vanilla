import Main from "@/Main.tsx"
import React from "react"
import ReactDOM from "react-dom/client"
import "@/index.css"
import {PixelawProvider} from "@pixelaw/react"
import {BrowserRouter} from "react-router-dom"
import {DojoEngine} from "@pixelaw/core-dojo"
import {MudEngine} from "@pixelaw/core-mud"
import {getCoreDefaultsFromUrl, getWorldForUrl} from "@/utils.ts";
import {StarknetChainProvider} from "@pixelaw/react-dojo"
import {WorldsRegistry} from "@pixelaw/core";

// TODO for now hardcoded, but planning to retrieve from github URL using env WORLDS_REGISTRY_URL
import worldsRegistry from "@/config/worlds.json"

const world  = getWorldForUrl(worldsRegistry as WorldsRegistry, window.location.href, "local")

const rootElement = document.getElementById("root")

const engines = {"dojo": DojoEngine, "mud": MudEngine}

const coreDefaults = getCoreDefaultsFromUrl()

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <PixelawProvider worldsRegistry={worldsRegistry as WorldsRegistry} world={world} engines={engines} coreDefaults={coreDefaults}>
                    <BrowserRouter>
                        <StarknetChainProvider>
                        <Main />
                        </StarknetChainProvider>
                    </BrowserRouter>
                </PixelawProvider>
        </React.StrictMode>
    )
} else {
    console.error("Failed to find the root element")
}
