import 'server-only';

export {
  UnauthorizedError,
  LegalConsentRequiredError,
  isLegalConsentError,
  serverFetch,
  serverFetchRaw,
} from './server/core';
export {
  getAcademiesPublic,
  getCategories,
  getBlogArticles,
  getCourses,
  getCourseById,
  getPublicCourseDetail,
  verifyCertificate,
  getPublicLesson,
  getBlogArticleBySlug,
  getCurrentAcademy,
  getPublicAcademies,
  getAcademyBySlug,
  getAcademyEnrollmentStatus,
  getActiveStudentDiscounts,
  getCurrentUser,
} from './server/catalog';
export type { AcademyEnrollmentStatus } from './server/catalog';
export { getAcademyAddressStatus } from './server/academy-address';
export type { AcademyAddressStatus } from './server/academy-address';
export {
  getPublicPricingConfig,
  getPublicPlans,
  getUserProfiles,
  getEnrollments,
  createPayment,
  initiateCheckoutPayment,
} from './server/pricing';
export type { PublicPlan } from './server/pricing';
export {
  getAcademyPlansPublic,
  getAcademyBundlesPublic,
  getAcademyBundlePublic,
  getCoursePaymentPlans,
  getTutoringOffersPublic,
} from './server/offers';
export type {
  PublicBundleOffer,
  PublicPaymentPlan,
  PublicTutoringOffer,
  PublicTutoringGroupSlot,
} from './server/offers';
export {
  getCourseTopicsPublic,
  getTutoringGroupsPublic,
  getTutoringGroupByCode,
  getPaymentSummary,
  getCourseOfferingsPublic,
  initiateAcademyPlanPayment,
  createEnrollment,
} from './server/tutoring';
export type {
  PublicTutoringGroup,
  TutoringGroupByCodeResult,
  PublicOfferingType,
  PublicCourseOffering,
  PaymentSummary,
} from './server/tutoring';
export {
  getStoreThemeConfig,
  getCurrentUITemplate,
  getStoreUITemplate,
  getPreviewPreset,
} from './server/site-theme';
export type { PreviewPreset, CourseQnA } from './server/site-theme';
export {
  getCourseQnAs,
  createCourseQnA,
  validateDiscount,
  getCart,
  syncCart,
  addToCart,
  removeFromCart,
  clearCart,
  createBasket,
  getAcademySiteContent,
} from './server/cart-and-content';
export type {
  AcademyContactChannel,
  AcademyContactLink,
  AcademyStaticPage,
  AcademySiteContent,
} from './server/cart-and-content';
export type { PublicActiveDiscount } from './server/catalog';
