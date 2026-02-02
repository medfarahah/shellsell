import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import StoreProvider from "./StoreProvider";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

const siteUrl = "https://assalpay.store";

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Assal – Online Gadget Store in Djibouti",
        template: "%s | Assal",
    },
    description:
        "Shop smartphones, laptops, earphones and smart gadgets with Assal. Fast delivery across Djibouti and secure online payments.",
    openGraph: {
        title: "Assal – Online Gadget Store in Djibouti",
        description:
            "Discover the latest gadgets, phones, laptops and accessories at Assal with trusted prices and fast delivery.",
        url: "/",
        siteName: "Assal",
        locale: "en",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Assal – Online Gadget Store",
        description:
            "Buy gadgets, smartphones, laptops and accessories from Assal with fast delivery in Djibouti.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Assal",
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
    sameAs: [
        "https://www.facebook.com",
        "https://www.instagram.com",
        "https://twitter.com",
        "https://www.linkedin.com",
    ],
};

const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Assal",
    url: siteUrl,
    potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/shop?search={search_term_string}`,
        "query-input": "required name=search_term_string",
    },
};

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={`${outfit.className} antialiased`}>
                    <script
                        type="application/ld+json"
                        // Site-wide Organization + WebSite schema for rich results
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify([organizationSchema, webSiteSchema]),
                        }}
                    />
                    <StoreProvider>
                        <Toaster />
                        {children}
                    </StoreProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
