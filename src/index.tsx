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

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <PixelawProvider worldsRegistry={worldsRegistry} world={DEFAULT_WORLD} engines={engines}>
                    <BrowserRouter>
                        <Main />
                    </BrowserRouter>
                </PixelawProvider>
        </React.StrictMode>,
    )
} else {
    console.error("Failed to find the root element")
}
