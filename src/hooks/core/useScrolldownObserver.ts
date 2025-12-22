import { UseIntersectionObserverProps } from "@/lib/interfaces/core/iTable";
import { useCallback, useRef } from "react";
export function useScrollDownObserver({
    onIntersect,
    enabled = true,
    root = null,
    rootMargin = "0px",
    threshold = 0.1,
}: UseIntersectionObserverProps) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const observe = useCallback((node: Element | null) => {
        if (!enabled || !node) return;
        observerRef.current?.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) {
                onIntersect();
            }
        },
            { root, rootMargin, threshold }
        );

        observerRef.current.observe(node);
    },
        [enabled, onIntersect, root, rootMargin, threshold]);

    const disconnect = useCallback(() => {
        observerRef.current?.disconnect();
    }, []);

    return { observe, disconnect, };
}
