import { createApp } from "../../lib/mini-vue-esm.js"
import App from "./App.js"

let el = document.querySelector('#app')
createApp(App).mount(el)