/**
 * Type declarations for CSS Modules.
 *
 * Vite processes any file named *.module.css or *.module.scss as a CSS Module,
 * hashing all local class names so they are scoped to the importing component.
 * These declarations tell TypeScript that `import styles from "*.module.css/scss"`
 * returns a plain object mapping original class names to their hashed equivalents,
 * e.g. styles.tbl_heat → "tbl_heat_a1b2c3".
 *
 * Classes that must remain globally named (used as plain strings by components that
 * don't import the module) should be wrapped in `:global { }` inside the SCSS file.
 *
 * Note: do NOT add `declare module "*.scss"` or `declare module "*.css"` here —
 * those blanket declarations would allow side-effect imports of non-module files
 * without type checking and mask missing-file errors.
 */
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
