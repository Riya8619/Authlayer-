export function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId)
  if (!element) return

  const offset = 96
  const top = element.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: "smooth" })
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" })
}
