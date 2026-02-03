'use client';

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import toast from "react-hot-toast";

const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    mainEntity: {
        "@type": "Organization",
        name: "Assal",
        url: "https://assalpay.store",
        address: {
            "@type": "PostalAddress",
            addressLocality: "Djibouti-ville",
            addressCountry: "DJ",
        },
        contactPoint: [
            {
                "@type": "ContactPoint",
                telephone: "+25377485495",
                email: "assalpay@gmail.com",
                contactType: "Customer Service",
                areaServed: "DJ",
            },
        ],
    },
};

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // In a real app, you'd send this to an API endpoint
        // For now, we'll just show a success message
        setTimeout(() => {
            toast.success("Message sent! We'll get back to you soon.");
            setFormData({ name: "", email: "", subject: "", message: "" });
            setIsSubmitting(false);
        }, 1000);
    };

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
            />
            <div className="mx-6 min-h-[70vh]">
                <div className="max-w-4xl mx-auto py-12">
                    {/* Breadcrumb */}
                    <nav className="text-sm text-slate-600 mb-8" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-slate-800">
                            Home
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-800">Contact</span>
                    </nav>

                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">
                        Contact Us
                    </h1>

                    {/* Key Takeaway Box */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-600 p-6 rounded-lg mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">
                            Get in Touch
                        </h2>
                        <p className="text-slate-700">
                            Have a question or need help? Reach out to our customer service team.
                            We're here to help you with orders, product inquiries, or any other
                            questions you may have.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Contact Information */}
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
                                Contact Information
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-indigo-100 p-3 rounded-lg">
                                        <Phone className="text-indigo-600" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 mb-1">
                                            Phone
                                        </h3>
                                        <a
                                            href="tel:+25377485495"
                                            className="text-slate-600 hover:text-indigo-600 transition-colors"
                                        >
                                            +253 77 48 54 95
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-indigo-100 p-3 rounded-lg">
                                        <Mail className="text-indigo-600" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 mb-1">
                                            Email
                                        </h3>
                                        <a
                                            href="mailto:assalpay@gmail.com"
                                            className="text-slate-600 hover:text-indigo-600 transition-colors break-all"
                                        >
                                            assalpay@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-indigo-100 p-3 rounded-lg">
                                        <MapPin className="text-indigo-600" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 mb-1">
                                            Address
                                        </h3>
                                        <p className="text-slate-600">Djibouti-ville, Djibouti</p>
                                    </div>
                                </div>
                            </div>

                            {/* Business Hours */}
                            <div className="mt-8 p-6 bg-slate-50 rounded-lg">
                                <h3 className="font-semibold text-slate-800 mb-3">
                                    Business Hours
                                </h3>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <p>Dimanche - Samedi: 9:00 AM - 6:00 PM</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
                                Send Us a Message
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-slate-700 mb-2"
                                    >
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="Your name"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-slate-700 mb-2"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="your.email@example.com"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="subject"
                                        className="block text-sm font-medium text-slate-700 mb-2"
                                    >
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="What is this regarding?"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="message"
                                        className="block text-sm font-medium text-slate-700 mb-2"
                                    >
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                                        placeholder="Tell us how we can help..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        "Sending..."
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Additional Help Section */}
                    <section className="mt-12 p-6 bg-slate-50 rounded-lg">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">
                            Need More Help?
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
                            <p>
                                <Link
                                    href="/shop"
                                    className="text-indigo-600 hover:underline font-medium"
                                >
                                    Browse our products
                                </Link>{" "}
                                to find what you're looking for.
                            </p>
                            <p>
                                <Link
                                    href="/account"
                                    className="text-indigo-600 hover:underline font-medium"
                                >
                                    Check your account
                                </Link>{" "}
                                for order status and history.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
