"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { logout } from "./actions";
import { useRouter } from 'next/navigation';

const AuthButton = () => {
    const supabase = createClient();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const checkUser = async () => {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            setUser(data?.user ?? null);
        } catch (error) {
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        // 쿠키를 확인하여 로그인 상태 변경 감지
        const checkAuthStateChange = () => {
            const authStateChanged = document.cookie.includes('auth-state-changed=true');
            if (authStateChanged) {
                checkUser();
                document.cookie = 'auth-state-changed=; max-age=0'; // 쿠키 제거
            }
        };

        const interval = setInterval(checkAuthStateChange, 1000); // 1초마다 확인

        return () => {
            authListener.subscription.unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        setUser(null);
        router.refresh(); // 페이지 새로고침
    };

    if (loading) {
        return (
            <form>
                <Button variant="secondary" className="ml-4" disabled>로그인</Button>
            </form>
        );
    }

    return (
        <div>
            {user ? (
                <form>
                    <Button variant="secondary" className="ml-4" formAction={handleLogout}>로그아웃</Button>
                </form>
            ) : (
                <Button asChild variant="secondary" className="ml-4">
                    <Link href="/login">로그인</Link>
                </Button>
            )}
        </div>
    )
}

export default AuthButton;