'use client'
import Banner from "../../components/Banner";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BottomNav from "../../components/BottomNav";

export default function PublicLayout({ children }) {

    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
            <BottomNav />
            <div className="h-16 sm:hidden" />
        </>
    );
}
