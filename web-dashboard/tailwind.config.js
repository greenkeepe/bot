/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                accent: {
                    cyan: '#06b6d4',
                    violet: '#8b5cf6',
                    lime: '#84cc16',
                    rose: '#f43f5e',
                },
            },
        },
    },
    plugins: [],
};
