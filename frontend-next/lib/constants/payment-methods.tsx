import React from 'react';
import { 
    CreditCard, 
    Building2, 
    Bitcoin, 
    Wallet, 
    Globe, 
    Zap, 
    Smartphone,
    ArrowUpCircle
} from 'lucide-react';

export interface PaymentMethod {
    id: string;
    name: string;
    desc: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    badges: { text: string; color: string }[];
    footer: string;
    isComingSoon?: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: "stripe",
        name: "Credit/Debit Card",
        desc: "Visa, Mastercard, Amex",
        icon: <CreditCard className="h-6 w-6" />,
        iconBg: "bg-brand-500/20",
        iconColor: "text-brand-500",
        badges: [
            { text: "Instant", color: "text-brand-500 bg-brand-500/10" },
            { text: "2.9% Fee", color: "text-emerald-500 bg-emerald-500/10" }
        ],
        footer: "Powered by Stripe • Secure 3D authentication"
    },
    {
        id: "cellulant",
        name: "Cellulant",
        desc: "Mobile Money & Bank • Kenya, Ghana, etc.",
        icon: <Smartphone className="h-6 w-6" />,
        iconBg: "bg-brand-600/20",
        iconColor: "text-orange-600",
        badges: [
            { text: "Instant", color: "text-brand-500 bg-brand-500/10" },
            { text: "1.2% Fee", color: "text-emerald-500 bg-emerald-500/10" }
        ],
        footer: "Tingg platform • Pan-African payments"
    },
    {
        id: "coinpayments",
        name: "CoinPayments",
        desc: "Global Crypto Gateway • 20+ Coins",
        icon: <Bitcoin className="h-6 w-6" />,
        iconBg: "bg-amber-500/20",
        iconColor: "text-amber-500",
        badges: [
            { text: "15-45 min", color: "text-amber-500 bg-amber-500/10" },
            { text: "0.5% Fee", color: "text-emerald-500 bg-emerald-500/10" }
        ],
        footer: "Real-time exchange • Global crypto gateway"
    },
    {
        id: "paypal",
        name: "PayPal",
        desc: "Fiat balance or linked cards",
        icon: <ArrowUpCircle className="h-6 w-6" />,
        iconBg: "bg-brand-500/20",
        iconColor: "text-brand-400",
        badges: [
            { text: "Instant", color: "text-brand-500 bg-brand-500/10" },
            { text: "3.5% Fee", color: "text-rose-500 bg-rose-500/10" }
        ],
        footer: "Global availability • Buyer protection included"
    },
    {
        id: "bank",
        name: "Bank Transfer",
        desc: "Wire transfer, ACH, SEPA",
        icon: <Building2 className="h-6 w-6" />,
        iconBg: "bg-emerald-500/20",
        iconColor: "text-emerald-500",
        badges: [
            { text: "1-3 Days", color: "text-amber-500 bg-amber-500/10" },
            { text: "0% Fee", color: "text-emerald-500 bg-emerald-500/10" }
        ],
        footer: "Best for large deposits • No processing fees"
    },
    {
        id: "korapay",
        name: "Korapay",
        desc: "Nigeria & Kenya • Bank, Virtual Account",
        icon: <Globe className="h-6 w-6" />,
        iconBg: "bg-brand-600/20",
        iconColor: "text-brand-600",
        badges: [
            { text: "Instant", color: "text-brand-500 bg-brand-500/10" },
            { text: "1.5% Fee", color: "text-emerald-500 bg-emerald-500/10" }
        ],
        footer: "Fast payouts • Low transaction fees"
    },
    {
        id: "paystack",
        name: "PayStack",
        desc: "Africa • Cards, Bank, Mobile",
        icon: <Zap className="h-6 w-6" />,
        iconBg: "bg-cyan-500/20",
        iconColor: "text-cyan-500",
        badges: [
            { text: "Instant", color: "text-brand-500 bg-brand-500/10" },
            { text: "1.5% Fee", color: "text-emerald-500 bg-emerald-500/10" }
        ],
        footer: "Nigeria, Ghana, Kenya, South Africa"
    },
    {
        id: "flutterwave",
        name: "Flutterwave",
        desc: "Global • M-Pesa, Mobile Money",
        icon: <Smartphone className="h-6 w-6" />,
        iconBg: "bg-brand-500/20",
        iconColor: "text-brand-500",
        badges: [
            { text: "Instant", color: "text-brand-500 bg-brand-500/10" },
            { text: "1.4% Fee", color: "text-emerald-500 bg-emerald-500/10" }
        ],
        footer: "30+ African countries supported"
    },
    {
        id: "web3",
        name: "Web3 Wallet",
        desc: "MetaMask, WalletConnect",
        icon: <Wallet className="h-6 w-6" />,
        iconBg: "bg-rose-500/20",
        iconColor: "text-rose-500",
        badges: [
            { text: "Instant", color: "text-brand-500 bg-brand-500/10" },
            { text: "Gas Only", color: "text-emerald-500 bg-emerald-500/10" }
        ],
        footer: "Connect your DeFi wallet directly"
    }
];
