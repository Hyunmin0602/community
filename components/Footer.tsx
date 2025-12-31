import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t bg-muted/50">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-3">Pixelit</h3>
                        <p className="text-sm text-muted-foreground">
                            마인크래프트의 모든 것, 픽셀릿.
                            <br />
                            다양한 서버와 자료를 탐험하고 공유하세요.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-3">링크</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="text-muted-foreground hover:text-primary">
                                    서버 목록
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/servers/new"
                                    className="text-muted-foreground hover:text-primary"
                                >
                                    서버 등록
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-3">소셜</h3>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="text-muted-foreground hover:text-primary"
                                aria-label="GitHub"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-muted-foreground hover:text-primary"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Pixelit. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
