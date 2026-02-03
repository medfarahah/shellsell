import Link from "next/link";

export const metadata = {
    title: "About Us – Assal Online Store",
    description:
        "Learn about Assal, your trusted online gadget store in Djibouti. We bring you the latest smartphones, laptops, and smart accessories with fast delivery and secure payments.",
    openGraph: {
        title: "About Assal – Your Trusted Gadget Store in Djibouti",
        description:
            "Discover how Assal became Djibouti's leading online marketplace for gadgets, electronics, and smart accessories.",
    },
};

const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntity: {
        "@type": "Organization",
        name: "Assal",
        description:
            "Assal is Djibouti's leading online marketplace for gadgets, smartphones, laptops, and smart accessories.",
        url: "https://assalpay.store",
        address: {
            "@type": "PostalAddress",
            addressLocality: "Djibouti-ville",
            addressCountry: "DJ",
        },
        contactPoint: {
            "@type": "ContactPoint",
            telephone: "+25377485495",
            email: "assalpay@gmail.com",
            contactType: "Customer Service",
        },
    },
};

export default function AboutPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
            />
            <div className="mx-6 min-h-[70vh]">
                <div className="max-w-4xl mx-auto py-12">
                    {/* Breadcrumb */}
                    <nav className="text-sm text-slate-600 mb-8" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-slate-800">
                            Home
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-800">About</span>
                    </nav>

                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">
                        About Assal
                    </h1>

                    {/* Key Takeaway Box */}
                    <div className="bg-gradient-to-r from-green-50 to-indigo-50 border-l-4 border-green-600 p-6 rounded-lg mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">
                            At a Glance
                        </h2>
                        <p className="text-slate-700">
                            Assal is Djibouti's trusted online marketplace for the latest gadgets,
                            smartphones, laptops, and smart accessories. We offer fast delivery,
                            secure payments, and trusted prices to customers across Djibouti.
                        </p>
                    </div>

                    {/* Our Story */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                            Our Story
                        </h2>
                        <div className="space-y-4 text-slate-700">
                            <p>
                                Welcome to Assal, your ultimate destination for the latest and
                                smartest gadgets. From smartphones and smartwatches to essential
                                accessories, we bring you the best in innovation — all in one place.
                            </p>
                            <p>
                                Founded to make quality electronics accessible to everyone in
                                Djibouti, Assal connects customers with trusted sellers offering
                                genuine products at competitive prices.
                            </p>
                            <p>
                                We believe in transparency, reliability, and exceptional customer
                                service. Every product on our platform is carefully vetted to ensure
                                quality and authenticity.
                            </p>
                        </div>
                    </section>

                    {/* What We Offer */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                            What We Offer
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                    Wide Product Range
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Browse thousands of products including smartphones, laptops,
                                    earphones, headphones, and smart accessories from trusted sellers.
                                </p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                    Fast Delivery
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Enjoy free shipping on orders above $50. We deliver across
                                    Djibouti with reliable and secure shipping options.
                                </p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                    Secure Payments
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Shop with confidence using our 100% secured payment system.
                                    Your transactions are protected and encrypted.
                                </p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                    Trusted Sellers
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    All sellers on Assal are verified and rated by customers. We
                                    ensure quality and authenticity for every product.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Our Mission */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                            Our Mission
                        </h2>
                        <p className="text-slate-700 mb-4">
                            To make quality electronics and gadgets accessible to everyone in
                            Djibouti while supporting local sellers and businesses.
                        </p>
                        <p className="text-slate-700">
                            We're committed to providing exceptional customer service, competitive
                            prices, and a seamless shopping experience from browsing to delivery.
                        </p>
                    </section>

                    {/* Call to Action */}
                    <section className="bg-slate-800 text-white p-8 rounded-lg text-center">
                        <h2 className="text-2xl font-semibold mb-4">
                            Ready to Shop?
                        </h2>
                        <p className="mb-6 text-slate-200">
                            Explore our wide range of products and discover the latest gadgets at
                            unbeatable prices.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/shop"
                                className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-medium transition-colors"
                            >
                                Browse Products
                            </Link>
                            <Link
                                href="/contact"
                                className="bg-white text-slate-800 hover:bg-slate-100 px-8 py-3 rounded-lg font-medium transition-colors"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
