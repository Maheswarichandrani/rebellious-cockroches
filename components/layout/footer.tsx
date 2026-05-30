import Link from "next/link"
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaXTwitter, FaArrowRight } from "react-icons/fa6"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function Footer() {
    const iconColor = "text-muted-foreground hover:text-foreground transition-colors"

    return (
        <footer className="w-full bg-background mt-auto">
            <div className="page-container py-12 md:py-16">
                <div className="flex flex-col gap-12">

                    {/* Top Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="space-y-1.5">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                                Join the club
                            </h2>
                            <p className="text-sm md:text-base text-muted-foreground">
                                Get exclusive deals and early access to new products.
                            </p>
                        </div>

                        <div className="w-full md:w-auto md:min-w-[360px]">
                            <form className="relative flex items-center w-full" >
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    className="w-full rounded-full h-12 px-6 pr-14 text-sm bg-transparent"
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 text-foreground/80 hover:bg-accent hover:text-foreground"
                                    aria-label="Subscribe"
                                >
                                    <FaArrowRight size={14} />
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Divider */}
                    <Separator className="bg-border/60" />

                    {/* Bottom Section */}
                    <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6">
                        <p className="text-xs text-muted-foreground">
                            © 2026 Horizon, Powered by Shopify
                        </p>
                        <div className="flex items-center gap-5">
                            <Link href="#" className={iconColor} aria-label="Facebook">
                                <FaFacebook size={18} />
                            </Link>
                            <Link href="#" className={iconColor} aria-label="Instagram">
                                <FaInstagram size={18} />
                            </Link>
                            <Link href="#" className={iconColor} aria-label="YouTube">
                                <FaYoutube size={18} />
                            </Link>
                            <Link href="#" className={iconColor} aria-label="TikTok">
                                <FaTiktok size={18} />
                            </Link>
                            <Link href="#" className={iconColor} aria-label="X (Twitter)">
                                <FaXTwitter size={18} />
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    )
}
