"use client"

import { motion } from "framer-motion"
import { BookOpen, Check, CreditCard, Mail, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { scrollToSection } from "@/lib/scroll"

const docLinks = [
  { title: "Quick Start", desc: "Run your first image or URL forensic scan in under 60 seconds." },
  { title: "API Reference", desc: "Integrate /scan-image and /scan-url into your security pipeline." },
  { title: "Trust Scoring", desc: "Understand risk levels, metadata integrity, and AI probability signals." },
]

const pricingTiers = [
  {
    name: "Starter",
    price: "$0",
    detail: "For evaluation and hackathon demos",
    features: ["50 scans / month", "Image + URL scanning", "Trust dashboard"],
  },
  {
    name: "Growth",
    price: "$299",
    detail: "For security teams and startups",
    features: ["10k scans / month", "Priority inference", "Webhook alerts", "Team seats"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    detail: "For regulated organizations",
    features: ["Unlimited scale", "Private deployment", "SSO + audit logs", "SLA support"],
  },
]

export function DocumentationSection() {
  return (
    <section id="docs" className="py-20 sm:py-24 px-4 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 text-primary text-sm mb-3">
            <BookOpen className="w-4 h-4" />
            Documentation
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ship with confidence
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything your team needs to integrate AuthLayer into production workflows.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {docLinks.map((item, index) => (
            <motion.button
              key={item.title}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -2 }}
              onClick={() => scrollToSection("scan")}
              className="text-left glass-elevated rounded-xl p-6 panel-gradient border border-border/50 hover:border-primary/40 transition-colors"
            >
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-24 px-4 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 text-primary text-sm mb-3">
            <CreditCard className="w-4 h-4" />
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Plans for every security team
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start free, scale when you are ready. No payment required for demo usage.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className={`glass-elevated rounded-2xl p-6 panel-gradient border ${
                tier.highlighted
                  ? "border-primary/50 soft-ring"
                  : "border-border/50"
              }`}
            >
              <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
              <p className="mt-2 text-3xl font-bold text-primary">{tier.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{tier.detail}</p>
              <ul className="mt-6 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-6"
                variant={tier.highlighted ? "default" : "outline"}
                onClick={() => scrollToSection("scan")}
              >
                {tier.name === "Enterprise" ? "Contact Sales" : "Start Scanning"}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ContactSection() {
  return (
    <section id="contact" className="py-20 sm:py-24 px-4 scroll-mt-24">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-elevated rounded-2xl p-8 sm:p-12 panel-gradient border border-border/50"
        >
          <div className="inline-flex items-center gap-2 text-primary text-sm mb-3">
            <MessageSquare className="w-4 h-4" />
            Contact
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Talk to our team
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Questions about deployment, enterprise pricing, or integrating the
            AuthLayer API into your pipeline? Reach out and we&apos;ll follow up.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="soft-ring">
              <a href="mailto:sales@authlayer.example">
                <Mail className="mr-2 h-4 w-4" />
                sales@authlayer.example
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border/70 bg-card/30 hover:bg-card/50"
              onClick={() => scrollToSection("scan")}
            >
              Try a scan instead
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
