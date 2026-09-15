"use client";

import React, { useEffect } from 'react';

const GoogleTranslate: React.FC = () => {
    useEffect(() => {
        const addScript = () => {
            const script = document.createElement('script');
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);

            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        includedLanguages: 'en,tr,ar,es,fr,de,zh-CN,pt,ru,vi',
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false,
                    },
                    'google_translate_element'
                );
            };
        };

        if (!window.googleTranslateElementInit) {
            addScript();
        }
    }, []);

    return (
        <div className="google-translate-container">
            <div id="google_translate_element" className="h-[32px] overflow-hidden rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 flex items-center shadow-lg shadow-black/20" />
            <style jsx global>{`
                .goog-te-gadget-simple {
                    background-color: transparent !important;
                    border: none !important;
                    padding: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    font-family: inherit !important;
                }
                .goog-te-gadget-simple img {
                    display: none !important;
                }
                .goog-te-gadget-icon {
                    display: none !important;
                }
                .goog-te-menu-value {
                    color: rgba(255, 255, 255, 0.7) !important;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    margin: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 4px !important;
                }
                .goog-te-menu-value span:nth-child(3) {
                    display: none !important;
                }
                .goog-te-menu-value span:nth-child(5) {
                    color: #10b981 !important; /* Indigo accent */
                }
                .goog-te-gadget-simple .goog-te-menu-value span {
                    border-left: none !important;
                }
                .skiptranslate.goog-te-gadget {
                    margin: 0 !important;
                }
                iframe.goog-te-menu-frame {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
                    border-radius: 12px !important;
                }
                body {
                    top: 0 !important;
                }
                .goog-te-banner-frame {
                    display: none !important;
                }
            `}</style>
        </div>
    );
};

export default GoogleTranslate;

declare global {
    interface Window {
        googleTranslateElementInit: () => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        google: any;
    }
}
