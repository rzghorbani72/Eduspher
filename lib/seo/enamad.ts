/**
 * Enamad (Iranian e-commerce trust seal) site-ownership verification.
 *
 * Enamad proves we own mentoma.ir in three ways: a file at the site root, a
 * meta tag in the home page head, and the code shown in the page title. The
 * title one is meant to be temporary, so it stays behind an env flag that we
 * turn on only while the panel re-checks it.
 */
export const ENAMAD_CODE = "56180294";

export const isEnamadTitleVerification =
  process.env.NEXT_PUBLIC_ENAMAD_VERIFY_TITLE === "true";
