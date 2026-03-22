import { mount } from 'svelte'
import App from './App.svelte'
import './app.css'

const el = document.getElementById('app')
if (!el) {
  throw new Error('Missing #app element')
}

mount(App, { target: el })
