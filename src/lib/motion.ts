export const easePremium = [0.22, 1, 0.36, 1] as const

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easePremium },
  },
}

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  // Short exit keeps navigation feeling instant — a long symmetric exit under
  // AnimatePresence mode="wait" leaves a visible blank frame between routes.
  exit: { opacity: 0, transition: { duration: 0.12 } },
  transition: { duration: 0.28, ease: easePremium },
}
