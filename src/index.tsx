import Main from "@/Main.tsx"
import React from "react"
import ReactDOM from "react-dom/client"
import "@/index.css"
import { PixelawProvider } from "@pixelaw/react"
import { BrowserRouter } from "react-router-dom"

import worldsRegistry from "@/config/worlds.json"

import {DojoEngine} from "@pixelaw/core-dojo"
import {MudEngine} from "@pixelaw/core-mud"
import {DEFAULT_WORLD} from "@/utils.ts";


const rootElement = document.getElementById("root")

const engines = [DojoEngine, MudEngine]


// Parse query string for CoreDefaults
const queryParams = new URLSearchParams(window.location.search)
const app = queryParams.get("app") || ""
const color = parseInt(queryParams.get("color") || "0", 10)
const center = queryParams.get("center")?.split(",").map(Number) as [number, number] | undefined
const zoom = parseInt(queryParams.get("zoom") || "0", 10)

// Validate and construct CoreDefaults
const coreDefaults = {
    app,
    color: isNaN(color) ? 0 : color,
    center: center && center.length === 2 ? center : [0, 0],
    zoom: isNaN(zoom) ? 0 : zoom,
}


if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <PixelawProvider worldsRegistry={worldsRegistry} world={DEFAULT_WORLD} engines={engines} coreDefaults={coreDefaults}>
                    <BrowserRouter>
                        <Main />
                    </BrowserRouter>
                </PixelawProvider>
        </React.StrictMode>,
    )
} else {
    console.error("Failed to find the root element")
}
