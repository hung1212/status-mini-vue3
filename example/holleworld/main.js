import { createApp } from '../../lib/mini-vue-esm.js'
import { App } from './app.js'

let app = document.querySelector('#app')
createApp(App).mount(app)