import { useState, useRef, useEffect } from "react";
import { PaperPlaneTilt, MapPin, Phone, EnvelopeSimple, CheckCircle } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import CinematicMap from "./CinematicMap";

const PROJECT_TYPES = ["Construction", "Renovation", "Landscaping", "Maintenance", "Other"];

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    budget: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  /* ─────────────────────────────────────────────
     Supabase v2 — Create Contact Submission
  ───────────────────────────────────────────── */
  const createSubmission = async (payload: any) => {
    setIsPending(true);
    setMutationError(null);

    const { data, error } = await supabase
      .from("ContactSubmission")
      .insert(payload)
      .select()
      .single();

    setIsPending(false);

    if (error) {
      setMutationError(error.message);
      throw error;
    }

    return data;
  };

  /* ─────────────────────────────────────────────
     Intersection animations
  ───────────────────────────────────────────── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          setTimeout(() => el.classList.add("visible"), parseInt(el.dataset.delay || "0", 10));
          obs.unobserve(el);
        });
      },
      { threshold: 0.1 }
    );

    [leftRef.current, rightRef.current].forEach((el) => {
      if (el) {
        el.classList.add("stagger-child");
        obs.observe(el);
      }
    });

    return () => obs.disconnect();
  }, []);

  /* ─────────────────────────────────────────────
     Validation
  ───────────────────────────────────────────── */
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    if (!form.message.trim()) errs.message = "Message is required.";
    return errs;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  /* ─────────────────────────────────────────────
     Submit
  ───────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      await createSubmission(form);
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit contact form:", err);
    }
  };

  /* ─────────────────────────────────────────────
     UI
  ───────────────────────────────────────────── */
  return (
    <section id="contact" className="py-28 bg-white" aria-label="Contact us">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">

          {/* Left */}
          <div ref={leftRef} data-delay="0">
            <span className="section-eyebrow text-gold block mb-4">
              <span className="inline-block w-6 h-px bg-gold/60 mr-3 align-middle" />
              Get In Touch
            </span>

            <h2 className="font-headline font-bold text-fluid-2xl text-charcoal leading-[1.1] mb-6">
              Let's Build Something<br />Remarkable
            </h2>

            <p className="font-sans text-sm text-gray-500 leading-relaxed max-w-md mb-10">
              Tell us about your vision. Whether it's a ground-up build, a renovation, a driveway,
              or a full landscape — we'll craft a tailored plan that brings it to life.
            </p>

            <div className="flex flex-col gap-4 mb-10">
              {[
                { Icon: MapPin, label: "Location", value: "Montreal, Quebec, Canada", href: null },
                { Icon: Phone, label: "Phone", value: "+1 (514) 123-4567", href: "tel:+15141234567" },
                {
                  Icon: EnvelopeSimple,
                  label: "Email",
                  value: "info@amenagement-monzon.com",
                  href: "mailto:info@amenagement-monzon.com",
                },
              ].map(({ Icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-charcoal flex items-center justify-center flex-shrink-0">
                    <Icon size={20} weight="regular" className="text-gold" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="font-sans text-sm font-medium text-charcoal hover:text-gold transition-colors duration-200"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-sans text-sm font-medium text-charcoal">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <CinematicMap lat={45.5019} lng={-73.5674} zoom={12} className="h-48 w-full" />
          </div>

          {/* Right — Form */}
          <div ref={rightRef} data-delay="150">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm shadow-black/3">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-charcoal flex items-center justify-center animate-scale-in">
                    <CheckCircle size={36} weight="regular" className="text-gold" />
                  </div>

                  <div>
                    <h3 className="font-headline font-bold text-2xl text-charcoal">
                      Message Received!
                    </h3>
                    <p className="font-sans text-sm text-gray-500 mt-2 max-w-xs">
                      Our team will reach out within 24 hours to discuss your project.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        email: "",
                        phone: "",
                        projectType: "",
                        budget: "",
                        message: "",
                      });
                    }}
                    className="mt-2 px-6 py-3 text-sm font-sans font-medium bg-gold text-charcoal rounded-xl hover:bg-gold-dark transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="name"
                        className="font-mono text-[11px] uppercase tracking-widest text-gray-400"
                      >
                        Full Name <span className="text-gold">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Jean Dupont"
                        className={`w-full px-4 py-3 text-sm font-sans text-charcoal bg-gray-50 border rounded-xl outline-none transition-all duration-200 focus:bg-white placeholder:text-gray-300 ${
                          errors.name ? "border-red-400" : "border-gray-200 focus:border-charcoal"
                        }`}
                      />
                      {errors.name && (
                        <span className="text-[11px] text-red-500 font-sans">{errors.name}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="email"
                        className="font-mono text-[11px] uppercase tracking-widest text-gray-400"
                      >
                        Email <span className="text-gold">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jean@example.com"
                        className={`w-full px-4 py-3 text-sm font-sans text-charcoal bg-gray-50 border rounded-xl outline-none transition-all duration-200 focus:bg-white placeholder:text-gray-300 ${
                          errors.email ? "border-red-400" : "border-gray-200 focus:border-charcoal"
                        }`}
                      />
                      {errors.email && (
                        <span className="text-[11px] text-red-500 font-sans">{errors.email}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="phone"
                      className="font-mono text-[11px] uppercase tracking-widest text-gray-400"
                    >
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (514) 000-0000"
                      className="w-full px-4 py-3 text-sm font-sans text-charcoal bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:bg-white focus:border-charcoal placeholder:text-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="projectType"
                        className="font-mono text-[11px] uppercase tracking-widest text-gray-400"
                      >
                        Project Type
                      </label>
                      <select
                        id="projectType"
                        name="projectType"
                        value={form.projectType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-sm font-sans text-charcoal bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:bg-white focus:border-charcoal cursor-pointer"
                      >
                        <option value="">Select type…</option>
                        {PROJECT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="budget"
                        className="font-mono text-[11px] uppercase tracking-widest text-gray-400"
                      >
                        Budget Range
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        value={form.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-sm font-sans text-charcoal bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:bg-white focus:border-charcoal cursor-pointer"
                      >
                        <option value="">Select budget…</option>
                        <option value="under-10k">Under $10K</option>
                        <option value="10k-50k">$10K – $50K</option>
                        <option value="50k-150k">$50K – $150K</option>
                        <option value="150k+">$150K+</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="message"
                      className="font-mono text-[11px] uppercase tracking-widest text-gray-400"
                    >
                      Project Details <span className="text-gold">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your project, location, timeline…"
                      className={`w-full px-4 py-3 text-sm font-sans text-charcoal bg-gray-50 border rounded-xl outline-none transition-all duration-200 focus:bg-white placeholder:text-gray-300 resize-none ${
                        errors.message
                          ? "border-red-400"
                          : "border-gray-200 focus:border-charcoal"
                      }`}
                    />
                    {errors.message && (
                      <span className="text-[11px] text-red-500 font-sans">{errors.message}</span>
                    )}
                  </div>

                  {mutationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-sans">
                      Error: {mutationError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 text-sm font-sans font-semibold bg-gold text-charcoal rounded-xl transition-all duration-300 hover:bg-gold-dark hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      <>
                        <PaperPlaneTilt size={17} weight="bold" /> Send Message
                      </>
                    )}
                  </button>

                  <p className="text-center font-sans text-xs text-gray-400">
                    We respond within 24 hours. Your information stays private.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}