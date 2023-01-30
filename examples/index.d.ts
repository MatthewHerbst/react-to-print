// https://webpack.js.org/guides/typescript/
declare module "*.png" {
  const content: any;
  export default content;
}

declare module "*.woff2" {
  const content: string;
  export default content;
}
