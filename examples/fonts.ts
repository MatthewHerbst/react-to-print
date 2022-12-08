import BlackItalicFont from "./fonts/Inter-BlackItalic.woff2"
import LightFont from "./fonts/Inter-Thin.woff2"

export const CUSTOM_FONTS = [
  {
    family: "Inter",
    style: "normal",
    weight: "100",
    source: `url("${LightFont}") format("woff2")`,
  },
  {
    family: "Inter",
    style: "italic",
    weight: "900",
    source: `url("${BlackItalicFont}") format("woff2")`,
  },
]
