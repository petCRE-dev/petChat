import { join } from 'path';
import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import daisyui from 'daisyui';

export default {
	darkMode: 'class', // You can use 'class' or 'media' for dark mode handling with DaisyUI
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/daisyui/dist/**/*.js'
	],
	theme: {
		extend: {},
	},
	plugins: [
		forms,
		typography,
		daisyui // Add DaisyUI as a plugin
	],
	daisyui: {
		themes: [
			'bumblebee',      // Default light theme
			'dark',       // Default dark theme
			    // Additional DaisyUI themes (customize as needed)
			'forest', 
			'corporate',
			'synthwave'
		], 
		styled: true,
		base: true,
		utils: true,
		logs: true,
		rtl: false,
		prefix: "",
		darkTheme: "synthwave"  // Set the default dark theme
	}
} satisfies Config;
