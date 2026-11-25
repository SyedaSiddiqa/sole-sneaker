import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import TrustFeatures from '@/components/TrustFeatures'

const info = [
  { icon: MapPin, title: 'ADDRESS', lines: ['123 Fashion Avenue, New York, NY'] },
  { icon: Phone, title: 'PHONE', lines: ['+1 234 567 890'] },
  { icon: Mail, title: 'EMAIL', lines: ['hello@sole.com'] },
  { icon: Clock, title: 'WORKING HOURS', lines: ['Monday — Friday', '9:00 AM — 6:00 PM'] },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    gsap.fromTo('.contact-hero-el', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' })
    gsap.fromTo('.contact-info-item', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.12, delay: 0.3, ease: 'power3.out' })
    gsap.fromTo('.contact-form', { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' })
  }, [])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
      setTimeout(() => setSuccess(false), 4000)
    }, 1200)
  }

  return (
    <div>
      <section className="pt-36 pb-16 text-center max-w-3xl mx-auto px-6">
        <span className="contact-hero-el inline-block text-xs tracking-[0.35em] text-gold uppercase mb-4">Contact</span>
        <h1 className="contact-hero-el font-display text-5xl sm:text-6xl md:text-7xl mb-4">GET IN TOUCH</h1>
        <p className="contact-hero-el text-text-secondary text-lg">Have a question? We'd love to hear from you.</p>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-8">
          {info.map(({ icon: Icon, title, lines }) => (
            <div key={title} className="contact-info-item flex items-start gap-5 rounded-2xl glass p-6 gold-border-anim">
              <div className="h-11 w-11 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-widest text-gold uppercase mb-1">{title}</h3>
                {lines.map((l) => <p key={l} className="text-text-secondary text-sm">{l}</p>)}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="contact-form rounded-2xl glass p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={form.name} onChange={update('name')} placeholder="Your name" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={update('email')} placeholder="you@example.com" className="mt-2" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={update('phone')} placeholder="+1 234 567 890" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" required value={form.subject} onChange={update('subject')} placeholder="How can we help?" className="mt-2" />
            </div>
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" required value={form.message} onChange={update('message')} placeholder="Tell us more..." className="mt-2" />
          </div>
          <Button type="submit" size="lg" className="w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading ? 'SENDING...' : success ? 'MESSAGE SENT ✓' : <>SEND MESSAGE <Send size={15} /></>}
          </Button>
          {success && <p className="text-center text-sm text-gold animate-in fade-in">Thanks — we'll be in touch shortly.</p>}
        </form>
      </section>

      <TrustFeatures />
    </div>
  )
}
