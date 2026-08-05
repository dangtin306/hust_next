"use client";

import { Inter } from "next/font/google";
import { createStyleString } from "@capsizecss/core";
import interMetrics from "@capsizecss/metrics/inter";
import {
    useAlignIconCenterToTextCenterFromFrameGaps,
} from "./orders_pill_math";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
});

const META_PILL_TEXT_CLASS =
    "orders-related-meta-text";

/*
 * Fallback cho trình duyệt chưa hỗ trợ text-box.
 */
const META_PILL_CAPSIZE_FALLBACK =
    createStyleString(
        META_PILL_TEXT_CLASS,
        {
            fontSize: 12,
            leading: 12,
            fontMetrics: interMetrics,
        }
    );

const META_PILL_TEXT_CSS = `
${META_PILL_CAPSIZE_FALLBACK}

.${META_PILL_TEXT_CLASS} {
    display: block;
    flex: none;
    margin: 0;
    padding: 0;
    font-family: inherit;
    font-size: 12px;
    line-height: 12px;
    font-weight: 400;
    font-synthesis: none;
    white-space: nowrap;
}

@supports (text-box-trim: trim-both) and (text-box-edge: cap alphabetic) {
    .${META_PILL_TEXT_CLASS} {
        text-box-trim: trim-both;
        text-box-edge: cap alphabetic;
    }

    .${META_PILL_TEXT_CLASS}::before,
    .${META_PILL_TEXT_CLASS}::after {
        content: none !important;
        display: none !important;
        margin: 0 !important;
        padding: 0 !important;
    }
}
`;

function formatRelatedPostDate(
    dateRaw
) {
    const value = String(
        dateRaw || ""
    ).trim();

    if (!value) {
        return "";
    }

    const parsed = new Date(
        value.replace(" ", "T")
    );

    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return value;
    }

    return `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}`;
}

function CalendarIcon({
    className = "",
    svgRef,
    graphicRef,
    boundsRef,
    measureRef,
}) {
    return (
        <svg
            ref={svgRef}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            focusable="false"
            preserveAspectRatio="xMidYMid meet"
            shapeRendering="geometricPrecision"
            className={className}
        >
            {/*
             * graphicRef chứa path thật của icon.
             *
             * Group dùng pointer-events="bounding-box".
             * Path thật bị pointer-events="none".
             *
             * Vì vậy Chrome Element Picker bắt vào group này,
             * và thuật toán đo đúng bbox của art thật.
             */}
            <g
                ref={graphicRef}
                data-orders-icon-bounds-group="calendar"
                data-orders-devtools-target="true"
                pointerEvents="bounding-box"
                style={{
                    pointerEvents:
                        "bounding-box",
                }}
            >
                <path
                    data-orders-icon-art="calendar"
                    pointerEvents="none"
                    aria-hidden="true"
                    d="M7.5 2.75v2.5M16.5 2.75v2.5M3.75 8.75h16.5M6 4.75h12A2.25 2.25 0 0 1 20.25 7v11A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V7A2.25 2.25 0 0 1 6 4.75Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>

            {/*
             * Measure rect độc lập cho thuật toán căn.
             * Nó không nằm trong <g> DevTools và không nhận transform riêng.
             */}
            <rect
                ref={measureRef}
                x="2.9"
                y="1.9"
                width="18.2"
                height="19.2"
                fill="currentColor"
                fillOpacity="0"
                stroke="none"
                pointerEvents="none"
                aria-hidden="true"
                data-orders-icon-measure-bounds="calendar"
            />

            {/*
             * Bounds rect là sibling của graphic group.
             * Cả hai vẫn cùng nằm trong một SVG nên transform của SVG
             * luôn dịch chúng cùng nhau.
             */}
            <rect
                ref={boundsRef}
                x="2.9"
                y="1.9"
                width="18.2"
                height="19.2"
                fill="currentColor"
                fillOpacity="0.001"
                stroke="none"
                pointerEvents="none"
                aria-hidden="true"
                data-orders-icon-fixed-bounds="calendar"
                data-orders-devtools-bounds="true"
            />
        </svg>
    );
}

function TagIcon({
    className = "",
    svgRef,
    graphicRef,
    boundsRef,
    measureRef,
}) {
    return (
        <svg
            ref={svgRef}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            focusable="false"
            preserveAspectRatio="xMidYMid meet"
            shapeRendering="geometricPrecision"
            className={className}
        >
            {/*
             * Group graphic chứa path/circle thật của icon.
             * Thuật toán đo trực tiếp bbox của group này.
             */}
            <g
                ref={graphicRef}
                data-orders-icon-bounds-group="tag"
                data-orders-devtools-target="true"
                pointerEvents="bounding-box"
                style={{
                    pointerEvents:
                        "bounding-box",
                }}
            >
                <path
                    data-orders-icon-art="tag"
                    pointerEvents="none"
                    aria-hidden="true"
                    d="M10.25 4.75H6.75A2.25 2.25 0 0 0 4.5 7v4.043a2.25 2.25 0 0 0 .659 1.591l5.707 5.707a2.25 2.25 0 0 0 3.182 0l4.293-4.293a2.25 2.25 0 0 0 0-3.182l-5.909-5.909a2.25 2.25 0 0 0-1.591-.659Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <circle
                    data-orders-icon-art-dot="tag"
                    pointerEvents="none"
                    aria-hidden="true"
                    cx="8.25"
                    cy="8.25"
                    r="1.1"
                    fill="currentColor"
                />
            </g>

            <rect
                ref={measureRef}
                x="3.64"
                y="3.44"
                width="16.22"
                height="16.42"
                fill="currentColor"
                fillOpacity="0"
                stroke="none"
                pointerEvents="none"
                aria-hidden="true"
                data-orders-icon-measure-bounds="tag"
            />

            <rect
                ref={boundsRef}
                x="3.64"
                y="3.44"
                width="16.22"
                height="16.42"
                fill="currentColor"
                fillOpacity="0.001"
                stroke="none"
                pointerEvents="none"
                aria-hidden="true"
                data-orders-icon-fixed-bounds="tag"
                data-orders-devtools-bounds="true"
            />
        </svg>
    );
}

function MetaPill({
    label,
    Icon,
    className = "",
}) {
    const {
        pillRef,
        rowRef,
        textRef,
        svgRef,
        graphicRef,
        boundsRef,
        measureRef,
    } = useAlignIconCenterToTextCenterFromFrameGaps(
        label
    );

    return (
        <div
            ref={pillRef}
            data-orders-meta-pill="true"
            className={`
                box-border
                inline-flex
                shrink-0
                flex-nowrap
                items-center
                whitespace-nowrap
                rounded-full
                px-2
                text-slate-600
                ${className}
            `.trim()}
            style={{
                minWidth:
                    "max-content",
                paddingTop:
                    "4px",
                paddingBottom:
                    "4px",
            }}
        >
            <span
                ref={rowRef}
                className={`
                    ${inter.className}
                    inline-grid
                    h-[16px]
                    shrink-0
                    grid-cols-[12px_max-content]
                    items-center
                    gap-[4px]
                    whitespace-nowrap
                `.trim()}
                style={{
                    fontSynthesis:
                        "none",
                }}
            >
                <span
                    className="
                        grid
                        h-[12px]
                        w-[12px]
                        shrink-0
                        place-items-center
                        overflow-visible
                        leading-none
                    "
                >
                    <IconGuard
                        Icon={Icon}
                        svgRef={
                            svgRef
                        }
                        graphicRef={
                            graphicRef
                        }
                        boundsRef={
                            boundsRef
                        }
                        measureRef={
                            measureRef
                        }
                    />
                </span>

                <span
                    ref={textRef}
                    data-orders-meta-text="true"
                    className={`
                        ${META_PILL_TEXT_CLASS}
                        shrink-0
                        whitespace-nowrap
                        font-normal
                        text-slate-600
                    `.trim()}
                >
                    {label}
                </span>
            </span>
        </div>
    );
}

function IconGuard({
    Icon,
    svgRef,
    graphicRef,
    boundsRef,
    measureRef,
}) {
    return (
        <Icon
            svgRef={svgRef}
            graphicRef={graphicRef}
            boundsRef={boundsRef}
            measureRef={measureRef}
            className="
                block
                h-[12px]
                w-[12px]
                min-h-[12px]
                min-w-[12px]
                max-h-[12px]
                max-w-[12px]
                shrink-0
                overflow-visible
                leading-none
            "
        />
    );
}

/**
 * @param {{
 *   dateRaw?: string;
 *   hashName?: string;
 *   className?: string;
 * }} props
 */
export function OrdersPillPackage({
    dateRaw = "",
    hashName = "Hust Media",
    className = "",
}) {
    const dateLabel =
        formatRelatedPostDate(
            dateRaw
        );

    const safeHashName =
        String(
            hashName || ""
        ).trim() ||
        "Hust Media";

    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html:
                        META_PILL_TEXT_CSS,
                }}
            />

            <div
                className={`
                    mt-2
                    flex
                    w-full
                    flex-wrap
                    items-center
                    justify-start
                    gap-1.5
                    ${className}
                `.trim()}
            >
                {dateLabel ? (
                    <MetaPill
                        label={
                            dateLabel
                        }
                        Icon={
                            CalendarIcon
                        }
                        className="
                            border
                            border-slate-300/80
                            bg-slate-200/80
                        "
                    />
                ) : null}

                <MetaPill
                    label={
                        safeHashName
                    }
                    Icon={
                        TagIcon
                    }
                    className="
                        border
                        border-slate-300/80
                        bg-slate-200/80
                    "
                />
            </div>
        </>
    );
}