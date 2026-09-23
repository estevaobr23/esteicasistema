import {
  Barlow_Condensed,
  DM_Sans,
  Fraunces,
  Inter,
  Manrope,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
} from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap", preload: false, variable: "--catalog-font-inter" });
const manrope = Manrope({ subsets: ["latin"], display: "swap", preload: false, variable: "--catalog-font-manrope" });
const fraunces = Fraunces({ subsets: ["latin"], display: "swap", preload: false, variable: "--catalog-font-fraunces" });
const barlow = Barlow_Condensed({ weight: ["400", "500", "600", "700", "800"], subsets: ["latin"], display: "swap", preload: false, variable: "--catalog-font-barlow" });
const poppins = Poppins({ weight: ["400", "500", "600", "700"], subsets: ["latin"], display: "swap", preload: false, variable: "--catalog-font-poppins" });
const space = Space_Grotesk({ subsets: ["latin"], display: "swap", preload: false, variable: "--catalog-font-space" });
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", preload: false, variable: "--catalog-font-playfair" });
const dm = DM_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--catalog-font-dm" });

export const CATALOG_FONT_VARIABLE_CLASSES = [
  inter.variable,
  manrope.variable,
  fraunces.variable,
  barlow.variable,
  poppins.variable,
  space.variable,
  playfair.variable,
  dm.variable,
].join(" ");

