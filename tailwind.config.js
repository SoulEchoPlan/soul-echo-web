/** @type {import('tailwindcss').Config} */
export default {
  // 这是关键：告诉 Tailwind 去扫描这些文件，寻找需要编译的 class
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
