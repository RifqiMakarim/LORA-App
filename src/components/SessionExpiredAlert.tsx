'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Swal from 'sweetalert2';

function SessionExpiredAlertContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const alertParam = searchParams.get('alert');

        if (alertParam === 'session_expired') {
            Swal.fire({
                title: 'Sesi Berakhir',
                text: 'Sesi Anda telah habis atau tidak valid. Silakan login kembali.',
                icon: 'warning',
                confirmButtonColor: '#D97706', // Terracotta Warm LORA
                confirmButtonText: 'Mengerti',
                customClass: {
                    popup: 'rounded-3xl font-sans',
                    confirmButton: 'rounded-xl text-xs font-bold px-5 py-2.5',
                },
                willClose: () => {
                    if (typeof document !== 'undefined') {
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                        document.documentElement.style.overflow = '';
                        document.body.classList.remove('swal2-shown', 'swal2-height-auto');
                        document.documentElement.classList.remove('swal2-shown', 'swal2-height-auto');
                    }
                },
                didClose: () => {
                    if (typeof document !== 'undefined') {
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                        document.documentElement.style.overflow = '';
                        document.body.classList.remove('swal2-shown', 'swal2-height-auto');
                        document.documentElement.classList.remove('swal2-shown', 'swal2-height-auto');
                    }
                },
            }).then(() => {
                // Bersihkan parameter query ?alert=session_expired dari URL agar tidak muncul terus-menerus saat refresh
                const params = new URLSearchParams(searchParams.toString());
                params.delete('alert');
                const queryString = params.toString();
                const cleanUrl = queryString ? `${pathname}?${queryString}` : pathname;
                router.replace(cleanUrl);
            });
        }
    }, [searchParams, router, pathname]);

    return null;
}

export default function SessionExpiredAlert() {
    return (
        <Suspense fallback={null}>
            <SessionExpiredAlertContent />
        </Suspense>
    );
}
