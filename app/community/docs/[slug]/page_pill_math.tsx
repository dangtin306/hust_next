/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import {
    useLayoutEffect,
    useRef,
} from "react";

/*
 * Một bộ điều phối dùng chung cho toàn bộ MetaPill trên trang.
 *
 * Mục tiêu:
 * - Không tạo window listener riêng cho từng pill.
 * - Không tạo debounce riêng cho từng pill.
 * - Không log riêng từng pill thành hàng chục dòng.
 * - Gom mọi thay đổi zoom/resize/font thành một đợt duy nhất.
 */
const ALIGN_DEBOUNCE_MS = 160;
const MAX_ERROR_DEVICE_PX = 0.02;
const MIN_OFFSET_CHANGE_CSS_PX = 0.000001;
const MIN_IMPROVEMENT_DEVICE_PX = 0.001;
const DEBUG_META_PILL_ALIGNMENT = true;

/*
 * DevTools vẽ khung <g> theo device-pixel. Khi zoom nhỏ,
 * khung có thể bị làm tròn lên trên dù rect và icon cùng tọa độ.
 *
 * Cách xử lý:
 * - thuật toán căn icon dùng một measure rect riêng, không dịch;
 * - group <g> chỉ dành cho DevTools được đẩy xuống tối đa
 *   0.5 device-pixel tới điểm lưới kế tiếp;
 * - việc này không tác động tới icon thật hoặc phép căn chữ.
 */
const DEVTOOLS_GROUP_GRID_DEVICE_PX = 0.5;
const DEVTOOLS_GROUP_EPSILON = 0.000001;

const metaPillInstances =
    new Set();

const dirtyMetaPillInstances =
    new Set();

const pendingAlignmentReasons =
    new Set();

let alignAllMetaPills = false;
let sharedRuntimeInstalled = false;

let sharedResizeObserver = null;

let sharedDebounceTimeoutId = 0;
let sharedFirstFrameId = 0;
let sharedSecondFrameId = 0;

let sharedGeneration = 0;
let sharedBatchNumber = 0;

let sharedDprMediaQuery = null;
let sharedDprChangeHandler = null;

let lastConsoleSignature = "";

/*
 * Chrome trên máy hiện tại phản ánh browser zoom
 * qua devicePixelRatio.
 */
function getBrowserZoomPercent() {
    return Math.round(
        (
            window.devicePixelRatio ||
            1
        ) * 100
    );
}

function cancelSharedFrames() {
    if (sharedFirstFrameId) {
        cancelAnimationFrame(
            sharedFirstFrameId
        );

        sharedFirstFrameId = 0;
    }

    if (sharedSecondFrameId) {
        cancelAnimationFrame(
            sharedSecondFrameId
        );

        sharedSecondFrameId = 0;
    }
}

function clearSharedDebounce() {
    if (sharedDebounceTimeoutId) {
        clearTimeout(
            sharedDebounceTimeoutId
        );

        sharedDebounceTimeoutId = 0;
    }
}

function removeSharedDprWatcher() {
    if (
        sharedDprMediaQuery &&
        sharedDprChangeHandler
    ) {
        sharedDprMediaQuery.removeEventListener(
            "change",
            sharedDprChangeHandler
        );
    }

    sharedDprMediaQuery = null;
    sharedDprChangeHandler = null;
}

function installSharedDprWatcher() {
    removeSharedDprWatcher();

    if (
        typeof window ===
            "undefined" ||
        typeof window.matchMedia !==
            "function"
    ) {
        return;
    }

    sharedDprMediaQuery =
        window.matchMedia(
            `(resolution: ${window.devicePixelRatio}dppx)`
        );

    sharedDprChangeHandler =
        () => {
            installSharedDprWatcher();

            scheduleMetaPillAlignment({
                reason:
                    "device-pixel-ratio-change",
                all: true,
            });
        };

    sharedDprMediaQuery.addEventListener(
        "change",
        sharedDprChangeHandler,
        {
            once: true,
        }
    );
}

function logAlignmentBatch(
    results,
    reasons
) {
    if (
        !DEBUG_META_PILL_ALIGNMENT ||
        results.length === 0
    ) {
        return;
    }

    const zoomPercent =
        getBrowserZoomPercent();

    const rows =
        results
            .filter(Boolean)
            .map(
                (result) => ({
                    Khung:
                        result.pillIndex,
                    Label:
                        result.label,
                    OffsetY:
                        `${result.offsetCssY.toFixed(
                            6
                        )}px`,
                    SaiSốCònLại:
                        `${result.residualCorrectionCssY.toFixed(
                            6
                        )}px`,
                    SốLầnDịch:
                        result.correctionCount,
                    TrạngThái:
                        result.state,
                })
            );

    if (rows.length === 0) {
        return;
    }

    const consoleSignature =
        JSON.stringify({
            zoomPercent,
            rows,
        });

    /*
     * React Strict Mode hoặc nhiều observer có thể yêu cầu
     * cùng một đợt với kết quả y hệt.
     * Không in lại nếu nội dung log không đổi.
     */
    if (
        consoleSignature ===
        lastConsoleSignature
    ) {
        return;
    }

    lastConsoleSignature =
        consoleSignature;

    console.groupCollapsed(
        `[MetaPill - Zoom ${zoomPercent}%] ${rows.length} pill | ${reasons}`
    );

    console.table(
        rows
    );

    console.groupEnd();
}

async function runSharedAlignmentBatch(
    generation,
    instances,
    reasons
) {
    if (
        generation !==
        sharedGeneration
    ) {
        return;
    }

    const runnableInstances =
        instances.filter(
            (instance) =>
                instance.isConnected() &&
                instance.hasGeometryChanged()
        );

    if (
        runnableInstances.length ===
        0
    ) {
        return;
    }

    sharedBatchNumber += 1;

    const results =
        await Promise.all(
            runnableInstances.map(
                (instance) =>
                    instance.align({
                        generation,
                        batchNumber:
                            sharedBatchNumber,
                        reasons,
                    })
            )
        );

    if (
        generation !==
        sharedGeneration
    ) {
        return;
    }

    logAlignmentBatch(
        results.filter(Boolean),
        reasons
    );
}

function flushScheduledMetaPillAlignment() {
    clearSharedDebounce();
    cancelSharedFrames();

    const generation =
        sharedGeneration;

    const reasons =
        Array.from(
            pendingAlignmentReasons
        ).join(
            "+"
        ) ||
        "unknown";

    pendingAlignmentReasons.clear();

    const instances =
        alignAllMetaPills
            ? Array.from(
                metaPillInstances
            )
            : Array.from(
                dirtyMetaPillInstances
            );

    alignAllMetaPills = false;
    dirtyMetaPillInstances.clear();

    if (
        instances.length ===
        0
    ) {
        return;
    }

    /*
     * Chờ hai frame để Chrome hoàn tất layout sau zoom.
     *
     * Không reset icon về 0px nên trong lúc chờ
     * icon vẫn giữ vị trí cũ, không bị nháy.
     */
    sharedFirstFrameId =
        requestAnimationFrame(
            () => {
                sharedFirstFrameId = 0;

                sharedSecondFrameId =
                    requestAnimationFrame(
                        () => {
                            sharedSecondFrameId = 0;

                            void runSharedAlignmentBatch(
                                generation,
                                instances,
                                reasons
                            );
                        }
                    );
            }
        );
}

function scheduleMetaPillAlignment({
    instance = null,
    reason,
    all = false,
    immediate = false,
}) {
    if (
        typeof window ===
        "undefined"
    ) {
        return;
    }

    pendingAlignmentReasons.add(
        reason
    );

    if (all) {
        alignAllMetaPills = true;
        dirtyMetaPillInstances.clear();
    } else if (
        instance &&
        !alignAllMetaPills
    ) {
        dirtyMetaPillInstances.add(
            instance
        );
    }

    /*
     * Mọi event mới làm đợt đang chờ trở nên cũ.
     * Đợt mới sẽ chạy sau khi zoom/resize dừng.
     */
    sharedGeneration += 1;

    clearSharedDebounce();
    cancelSharedFrames();

    if (immediate) {
        sharedDebounceTimeoutId =
            window.setTimeout(
                flushScheduledMetaPillAlignment,
                0
            );

        return;
    }

    sharedDebounceTimeoutId =
        window.setTimeout(
            flushScheduledMetaPillAlignment,
            ALIGN_DEBOUNCE_MS
        );
}

function handleSharedWindowResize() {
    scheduleMetaPillAlignment({
        reason:
            "window-resize",
        all: true,
    });
}

function handleSharedViewportResize() {
    scheduleMetaPillAlignment({
        reason:
            "visual-viewport-resize",
        all: true,
    });
}

function handleSharedOrientationChange() {
    scheduleMetaPillAlignment({
        reason:
            "orientation-change",
        all: true,
    });
}

function handleSharedPageShow() {
    scheduleMetaPillAlignment({
        reason:
            "pageshow",
        all: true,
    });
}

function handleSharedVisibilityChange() {
    if (
        document.visibilityState ===
        "visible"
    ) {
        scheduleMetaPillAlignment({
            reason:
                "tab-visible",
            all: true,
        });
    }
}

function handleSharedFontChange() {
    scheduleMetaPillAlignment({
        reason:
            "font-change",
        all: true,
    });
}

function installSharedRuntime() {
    if (
        sharedRuntimeInstalled ||
        typeof window ===
            "undefined"
    ) {
        return;
    }

    sharedRuntimeInstalled = true;

    if (
        typeof ResizeObserver !==
        "undefined"
    ) {
        sharedResizeObserver =
            new ResizeObserver(
                (entries) => {
                    const affectedInstances =
                        new Set();

                    for (
                        const entry of
                        entries
                    ) {
                        const instance =
                            entry.target
                                .__ordersMetaPillInstance;

                        if (instance) {
                            affectedInstances.add(
                                instance
                            );
                        }
                    }

                    for (
                        const instance of
                        affectedInstances
                    ) {
                        scheduleMetaPillAlignment({
                            instance,
                            reason:
                                "resize-observer",
                        });
                    }
                }
            );
    }

    window.addEventListener(
        "resize",
        handleSharedWindowResize,
        {
            passive: true,
        }
    );

    window.visualViewport?.addEventListener(
        "resize",
        handleSharedViewportResize,
        {
            passive: true,
        }
    );

    window.addEventListener(
        "orientationchange",
        handleSharedOrientationChange,
        {
            passive: true,
        }
    );

    window.addEventListener(
        "pageshow",
        handleSharedPageShow,
        {
            passive: true,
        }
    );

    document.addEventListener(
        "visibilitychange",
        handleSharedVisibilityChange
    );

    if (document.fonts) {
        document.fonts.ready.then(
            () => {
                if (
                    sharedRuntimeInstalled
                ) {
                    scheduleMetaPillAlignment({
                        reason:
                            "fonts-ready",
                        all: true,
                    });
                }
            }
        );

        document.fonts.addEventListener?.(
            "loadingdone",
            handleSharedFontChange
        );

        document.fonts.addEventListener?.(
            "loadingerror",
            handleSharedFontChange
        );
    }

    installSharedDprWatcher();
}

function uninstallSharedRuntime() {
    if (
        !sharedRuntimeInstalled
    ) {
        return;
    }

    sharedRuntimeInstalled = false;
    sharedGeneration += 1;

    clearSharedDebounce();
    cancelSharedFrames();
    removeSharedDprWatcher();

    sharedResizeObserver?.disconnect();
    sharedResizeObserver = null;

    window.removeEventListener(
        "resize",
        handleSharedWindowResize
    );

    window.visualViewport?.removeEventListener(
        "resize",
        handleSharedViewportResize
    );

    window.removeEventListener(
        "orientationchange",
        handleSharedOrientationChange
    );

    window.removeEventListener(
        "pageshow",
        handleSharedPageShow
    );

    document.removeEventListener(
        "visibilitychange",
        handleSharedVisibilityChange
    );

    document.fonts?.removeEventListener?.(
        "loadingdone",
        handleSharedFontChange
    );

    document.fonts?.removeEventListener?.(
        "loadingerror",
        handleSharedFontChange
    );

    dirtyMetaPillInstances.clear();
    pendingAlignmentReasons.clear();

    alignAllMetaPills = false;
    lastConsoleSignature = "";
}

/*
 * Tạo thuật toán riêng cho một MetaPill.
 *
 * Không có MAX_ITERATIONS.
 *
 * Thuật toán tự dừng khi:
 * - sai số đã đủ nhỏ;
 * - target bị lặp lại;
 * - offset nhỏ đến mức không thể áp dụng thêm;
 * - hoặc sai số không còn cải thiện.
 */
function createMetaPillAlignmentInstance({
    label,
    pill,
    row,
    text,
    svg,
    graphic,
    bounds,
    measure,
}) {
    let destroyed = false;
    let localRunId = 0;

    let activeResolve = null;

    const localFrameIds =
        new Set();

    let currentOffsetCssY =
        Number.parseFloat(
            svg.getAttribute(
                "data-icon-offset-y"
            ) ||
            "0"
        );

    if (
        !Number.isFinite(
            currentOffsetCssY
        )
    ) {
        currentOffsetCssY = 0;
    }

    let lastGeometrySignature = "";

    const originalTransform =
        svg.style.getPropertyValue(
            "transform"
        );

    const originalTransformPriority =
        svg.style.getPropertyPriority(
            "transform"
        );

    const originalTransformOrigin =
        svg.style.getPropertyValue(
            "transform-origin"
        );

    const originalTransformOriginPriority =
        svg.style.getPropertyPriority(
            "transform-origin"
        );

    const originalWillChange =
        svg.style.getPropertyValue(
            "will-change"
        );

    const originalWillChangePriority =
        svg.style.getPropertyPriority(
            "will-change"
        );

    const originalGraphicTransform =
        graphic.getAttribute(
            "transform"
        );

    graphic.removeAttribute(
        "transform"
    );

    function restoreGraphicTransform() {
        if (
            originalGraphicTransform ===
            null
        ) {
            graphic.removeAttribute(
                "transform"
            );
        } else {
            graphic.setAttribute(
                "transform",
                originalGraphicTransform
            );
        }

        graphic.removeAttribute(
            "data-orders-devtools-shift-device-y"
        );

        graphic.removeAttribute(
            "data-orders-devtools-shift-css-y"
        );

        graphic.removeAttribute(
            "data-orders-devtools-shift-viewbox-y"
        );
    }

    /*
     * Chỉ dịch group hiển thị cho DevTools.
     * measure rect và path/circle thật không bị dịch.
     */
    function updateDevtoolsGroupPosition() {
        if (
            destroyed ||
            !svg.isConnected ||
            !graphic.isConnected ||
            !measure.isConnected
        ) {
            return;
        }

        const devicePixelRatio =
            window.devicePixelRatio ||
            1;

        /*
         * Ở 100% giữ nguyên vì khung vốn đã chuẩn.
         */
        if (
            Math.abs(
                devicePixelRatio -
                1
            ) <=
            DEVTOOLS_GROUP_EPSILON
        ) {
            restoreGraphicTransform();

            return;
        }

        const measureRect =
            measure.getBoundingClientRect();

        const svgRect =
            svg.getBoundingClientRect();

        const viewBox =
            svg.viewBox?.baseVal;

        if (
            measureRect.height <= 0 ||
            svgRect.height <= 0 ||
            !viewBox ||
            viewBox.height <= 0
        ) {
            restoreGraphicTransform();

            return;
        }

        const currentCenterDeviceY =
            (
                measureRect.top +
                measureRect.height / 2
            ) *
            devicePixelRatio;

        /*
         * Luôn chọn điểm lưới kế tiếp ở phía dưới.
         * Nhờ đó khung <g> không còn có lúc bị làm tròn lên trên.
         */
        const targetCenterDeviceY =
            Math.ceil(
                (
                    currentCenterDeviceY -
                    DEVTOOLS_GROUP_EPSILON
                ) /
                DEVTOOLS_GROUP_GRID_DEVICE_PX
            ) *
            DEVTOOLS_GROUP_GRID_DEVICE_PX;

        const shiftDeviceY =
            Math.min(
                Math.max(
                    targetCenterDeviceY -
                    currentCenterDeviceY,
                    0
                ),
                DEVTOOLS_GROUP_GRID_DEVICE_PX
            );

        if (
            shiftDeviceY <=
            DEVTOOLS_GROUP_EPSILON
        ) {
            restoreGraphicTransform();

            return;
        }

        const shiftCssY =
            shiftDeviceY /
            devicePixelRatio;

        const scaleCssY =
            svgRect.height /
            viewBox.height;

        const shiftViewBoxY =
            shiftCssY /
            scaleCssY;

        const translate =
            `translate(0 ${shiftViewBoxY})`;

        graphic.setAttribute(
            "transform",
            originalGraphicTransform
                ? `${originalGraphicTransform} ${translate}`
                : translate
        );

        graphic.setAttribute(
            "data-orders-devtools-shift-device-y",
            shiftDeviceY.toFixed(
                7
            )
        );

        graphic.setAttribute(
            "data-orders-devtools-shift-css-y",
            shiftCssY.toFixed(
                7
            )
        );

        graphic.setAttribute(
            "data-orders-devtools-shift-viewbox-y",
            shiftViewBoxY.toFixed(
                7
            )
        );
    }

    /*
     * Đo <g> cho thuật toán khi <g> đang ở transform gốc.
     *
     * Correction riêng cho khung DevTools chỉ được áp lại sau khi đo,
     * nên không thể làm sai vị trí icon dùng trong phép căn.
     */
    function getGraphicRectForAlignment() {
        // Không transform graphic trước khi đo.

        const graphicRect =
            graphic.getBoundingClientRect();

        // Không transform graphic sau khi đo.

        return graphicRect;
    }

    svg.style.setProperty(
        "transform-origin",
        "center center",
        "important"
    );

    svg.style.setProperty(
        "will-change",
        "transform",
        "important"
    );

    let instance = null;

    const mutationObserver =
        typeof MutationObserver !==
        "undefined"
            ? new MutationObserver(
                () => {
                    scheduleMetaPillAlignment({
                        instance,
                        reason:
                            "pill-content-or-style-change",
                    });
                }
            )
            : null;

    function requestLocalFrame(
        callback
    ) {
        const frameId =
            requestAnimationFrame(
                () => {
                    localFrameIds.delete(
                        frameId
                    );

                    callback();
                }
            );

        localFrameIds.add(
            frameId
        );

        return frameId;
    }

    function cancelLocalFrames() {
        for (
            const frameId of
            localFrameIds
        ) {
            cancelAnimationFrame(
                frameId
            );
        }

        localFrameIds.clear();
    }

    function resolveActive(
        value
    ) {
        if (!activeResolve) {
            return;
        }

        const resolve =
            activeResolve;

        activeResolve = null;

        resolve(
            value
        );
    }

    function cancelActiveAlignment() {
        localRunId += 1;
        cancelLocalFrames();
        resolveActive(
            null
        );
    }

    /*
     * Đo đúng vùng render của text node,
     * không chỉ đo cả span.
     */
    function getTextRect() {
        const textNode =
            Array.from(
                text.childNodes
            ).find(
                (node) =>
                    node.nodeType ===
                        Node.TEXT_NODE &&
                    String(
                        node.textContent ||
                            ""
                    ).trim()
            );

        if (!textNode) {
            return text.getBoundingClientRect();
        }

        const range =
            document.createRange();

        range.selectNodeContents(
            textNode
        );

        const rangeRect =
            range.getBoundingClientRect();

        if (
            rangeRect.width > 0 &&
            rangeRect.height > 0
        ) {
            return rangeRect;
        }

        return text.getBoundingClientRect();
    }

    /*
     * Công thức gốc được giữ nguyên.
     *
     * iconRect lấy từ rect bounds cố định.
     *
     * graphicRef không chứa path/circle thật nên phép đo này
     * hoàn toàn độc lập với bbox stroke của trình duyệt.
     *
     * Rect vẫn nhận transform hiện tại của toàn bộ SVG.
     *
     * Vì vậy target tuyệt đối là:
     *
     * currentOffset + correction còn thiếu.
     */
    function measureCurrentGeometry() {
        const pillRect =
            pill.getBoundingClientRect();

        const textRect =
            getTextRect();

        /*
         * Đo rect bounds cố định.
         *
         * graphicRef chỉ chứa duy nhất rect bounds.
         * Path/circle thật là sibling bên ngoài graphicRef,
         * nên bbox của nét icon không thể kéo khung <g> lên hoặc xuống.
         *
         * Path/circle cũng bị tắt pointer-events trong pack,
         * vì vậy Chrome Element Picker sẽ ưu tiên bắt đúng group này.
         *
         * Rect không bao giờ bị JavaScript đổi x/y/width/height.
         */
        /*
         * Phép căn dùng measure rect độc lập.
         * Group DevTools có thể được dịch nhẹ mà không ảnh hưởng kết quả.
         */
        const iconRect =
            getGraphicRectForAlignment();

        if (
            pillRect.height === 0 ||
            textRect.height === 0 ||
            iconRect.height === 0
        ) {
            return null;
        }

        const pillHeight =
            pillRect.height;

        const textTopToFrameTop =
            textRect.top -
            pillRect.top;

        const textBottomToFrameBottom =
            pillRect.bottom -
            textRect.bottom;

        const textHeightFromFrameGaps =
            pillHeight -
            textTopToFrameTop -
            textBottomToFrameBottom;

        const iconTopToFrameTop =
            iconRect.top -
            pillRect.top;

        const iconBottomToFrameBottom =
            pillRect.bottom -
            iconRect.bottom;

        const iconHeightFromFrameGaps =
            pillHeight -
            iconTopToFrameTop -
            iconBottomToFrameBottom;

        if (
            textHeightFromFrameGaps <= 0 ||
            iconHeightFromFrameGaps <= 0
        ) {
            return null;
        }

        const textCenterDistanceFromFrameBottom =
            textBottomToFrameBottom +
            textHeightFromFrameGaps / 2;

        const iconCenterDistanceFromFrameBottom =
            iconBottomToFrameBottom +
            iconHeightFromFrameGaps / 2;

        const iconTranslateYCorrection =
            iconCenterDistanceFromFrameBottom -
            textCenterDistanceFromFrameBottom;

        const targetOffsetCssY =
            currentOffsetCssY +
            iconTranslateYCorrection;

        return {
            pillHeight,
            textTopToFrameTop,
            textBottomToFrameBottom,
            textHeightFromFrameGaps,
            iconTopToFrameTop,
            iconBottomToFrameBottom,
            iconHeightFromFrameGaps,
            textCenterDistanceFromFrameBottom,
            iconCenterDistanceFromFrameBottom,
            iconTranslateYCorrection,
            targetOffsetCssY,
        };
    }

    /*
     * Chữ ký chỉ chứa các thông số có thể làm
     * kết quả căn thay đổi.
     *
     * Không chứa vị trí top/left tuyệt đối của card,
     * nên cuộn trang không làm thuật toán chạy lại.
     */
    function createGeometrySignature() {
        if (
            !instance.isConnected()
        ) {
            return "";
        }

        const pillRect =
            pill.getBoundingClientRect();

        const rowRect =
            row.getBoundingClientRect();

        const textRect =
            getTextRect();

        const iconRect =
            getGraphicRectForAlignment();

        const textStyle =
            window.getComputedStyle(
                text
            );

        const round =
            (value) =>
                Number(
                    value
                ).toFixed(
                    3
                );

        return [
            round(
                window.devicePixelRatio ||
                1
            ),
            round(
                window.visualViewport?.scale ||
                1
            ),
            round(
                pillRect.width
            ),
            round(
                pillRect.height
            ),
            round(
                rowRect.width
            ),
            round(
                rowRect.height
            ),
            round(
                textRect.top -
                pillRect.top
            ),
            round(
                textRect.width
            ),
            round(
                textRect.height
            ),
            round(
                iconRect.width
            ),
            round(
                iconRect.height
            ),
            textStyle.fontFamily,
            textStyle.fontSize,
            textStyle.lineHeight,
            textStyle.fontWeight,
            label,
        ].join(
            "|"
        );
    }

    function writeDebugMeasurements(
        measurement,
        {
            batchNumber,
            reasons,
            correctionCount,
            state,
        }
    ) {
        svg.setAttribute(
            "data-align-run",
            String(
                batchNumber
            )
        );

        svg.setAttribute(
            "data-align-trigger",
            reasons
        );

        svg.setAttribute(
            "data-align-state",
            state
        );

        svg.setAttribute(
            "data-align-corrections",
            String(
                correctionCount
            )
        );

        svg.setAttribute(
            "data-pill-height",
            measurement.pillHeight.toFixed(
                6
            )
        );

        svg.setAttribute(
            "data-text-top-to-frame-top",
            measurement.textTopToFrameTop.toFixed(
                6
            )
        );

        svg.setAttribute(
            "data-text-bottom-to-frame-bottom",
            measurement.textBottomToFrameBottom.toFixed(
                6
            )
        );

        svg.setAttribute(
            "data-text-height-from-frame-gaps",
            measurement.textHeightFromFrameGaps.toFixed(
                6
            )
        );

        svg.setAttribute(
            "data-icon-top-to-frame-top",
            measurement.iconTopToFrameTop.toFixed(
                6
            )
        );

        svg.setAttribute(
            "data-icon-bottom-to-frame-bottom",
            measurement.iconBottomToFrameBottom.toFixed(
                6
            )
        );

        svg.setAttribute(
            "data-icon-height-from-frame-gaps",
            measurement.iconHeightFromFrameGaps.toFixed(
                6
            )
        );

        svg.setAttribute(
            "data-text-center-distance-from-frame-bottom",
            measurement.textCenterDistanceFromFrameBottom.toFixed(
                6
            )
        );

        svg.setAttribute(
            "data-icon-center-distance-from-frame-bottom",
            measurement.iconCenterDistanceFromFrameBottom.toFixed(
                6
            )
        );

        svg.setAttribute(
            "data-icon-translate-y-correction",
            measurement.iconTranslateYCorrection.toFixed(
                6
            )
        );

        svg.setAttribute(
            "data-device-pixel-ratio",
            String(
                window.devicePixelRatio ||
                1
            )
        );

        svg.setAttribute(
            "data-visual-viewport-scale",
            String(
                window.visualViewport?.scale ||
                1
            )
        );
    }

    /*
     * Gán offset tuyệt đối.
     *
     * Không reset về 0.
     * Không cộng dồn từ một phép đo cũ.
     */
    function applyAbsoluteOffset(
        targetOffsetCssY
    ) {
        const difference =
            targetOffsetCssY -
            currentOffsetCssY;

        if (
            Math.abs(
                difference
            ) <=
            MIN_OFFSET_CHANGE_CSS_PX
        ) {
            return false;
        }

        currentOffsetCssY =
            targetOffsetCssY;

        svg.style.setProperty(
            "transform",
            `translate3d(0px, ${currentOffsetCssY}px, 0px)`,
            "important"
        );

        svg.setAttribute(
            "data-icon-offset-y",
            currentOffsetCssY.toFixed(
                6
            )
        );

        svg.setAttribute(
            "data-icon-target",
            "same-pill-text-center-from-frame-edge-gaps"
        );

        return true;
    }

    function getPillIndex() {
        const parent =
            pill.parentElement;

        const pills =
            parent
                ? Array.from(
                    parent.querySelectorAll(
                        ':scope > [data-orders-meta-pill="true"]'
                    )
                )
                : [];

        return Math.min(
            Math.max(
                pills.indexOf(
                    pill
                ) + 1,
                1
            ),
            2
        );
    }

    function finishAlignment({
        runId,
        generation,
        batchNumber,
        reasons,
        correctionCount,
        state,
        residualCorrectionCssY,
    }) {
        if (
            destroyed ||
            runId !==
                localRunId ||
            generation !==
                sharedGeneration
        ) {
            resolveActive(
                null
            );

            return;
        }

        const finalMeasurement =
            measureCurrentGeometry();

        if (finalMeasurement) {
            writeDebugMeasurements(
                finalMeasurement,
                {
                    batchNumber,
                    reasons,
                    correctionCount,
                    state,
                }
            );
        }

        lastGeometrySignature =
            createGeometrySignature();

        resolveActive({
            pillIndex:
                getPillIndex(),
            label,
            offsetCssY:
                currentOffsetCssY,
            residualCorrectionCssY:
                finalMeasurement
                    ? finalMeasurement
                        .iconTranslateYCorrection
                    : residualCorrectionCssY,
            correctionCount,
            state,
        });
    }

    function align({
        generation,
        batchNumber,
        reasons,
    }) {
        cancelActiveAlignment();

        const runId =
            localRunId;

        return new Promise(
            (resolve) => {
                activeResolve =
                    resolve;

                const seenTargets =
                    new Set();

                let correctionCount = 0;

                let previousErrorDevicePx =
                    Number.POSITIVE_INFINITY;

                let bestErrorDevicePx =
                    Number.POSITIVE_INFINITY;

                let bestOffsetCssY =
                    currentOffsetCssY;

                function isCurrentRun() {
                    return (
                        !destroyed &&
                        runId ===
                            localRunId &&
                        generation ===
                            sharedGeneration &&
                        instance.isConnected()
                    );
                }

                function finishAtBestOffset(
                    state,
                    residualCorrectionCssY
                ) {
                    if (
                        Math.abs(
                            bestOffsetCssY -
                            currentOffsetCssY
                        ) >
                        MIN_OFFSET_CHANGE_CSS_PX
                    ) {
                        applyAbsoluteOffset(
                            bestOffsetCssY
                        );

                        requestLocalFrame(
                            () => {
                                finishAlignment({
                                    runId,
                                    generation,
                                    batchNumber,
                                    reasons,
                                    correctionCount,
                                    state,
                                    residualCorrectionCssY,
                                });
                            }
                        );

                        return;
                    }

                    finishAlignment({
                        runId,
                        generation,
                        batchNumber,
                        reasons,
                        correctionCount,
                        state,
                        residualCorrectionCssY,
                    });
                }

                function step() {
                    if (!isCurrentRun()) {
                        resolveActive(
                            null
                        );

                        return;
                    }

                    const measurement =
                        measureCurrentGeometry();

                    if (!measurement) {
                        finishAlignment({
                            runId,
                            generation,
                            batchNumber,
                            reasons,
                            correctionCount,
                            state:
                                "measurement-unavailable",
                            residualCorrectionCssY:
                                0,
                        });

                        return;
                    }

                    const correctionCssY =
                        measurement
                            .iconTranslateYCorrection;

                    const errorDevicePx =
                        Math.abs(
                            correctionCssY *
                            (
                                window.devicePixelRatio ||
                                1
                            )
                        );

                    if (
                        errorDevicePx <
                        bestErrorDevicePx
                    ) {
                        bestErrorDevicePx =
                            errorDevicePx;

                        bestOffsetCssY =
                            currentOffsetCssY;
                    }

                    writeDebugMeasurements(
                        measurement,
                        {
                            batchNumber,
                            reasons,
                            correctionCount,
                            state:
                                "measuring",
                        }
                    );

                    /*
                     * Đã đủ chính xác thì dừng tự nhiên.
                     */
                    if (
                        errorDevicePx <=
                        MAX_ERROR_DEVICE_PX
                    ) {
                        finishAlignment({
                            runId,
                            generation,
                            batchNumber,
                            reasons,
                            correctionCount,
                            state:
                                "aligned",
                            residualCorrectionCssY:
                                correctionCssY,
                        });

                        return;
                    }

                    const targetOffsetCssY =
                        measurement
                            .targetOffsetCssY;

                    const targetKey =
                        targetOffsetCssY.toFixed(
                            7
                        );

                    const improvementDevicePx =
                        previousErrorDevicePx -
                        errorDevicePx;

                    /*
                     * Browser đã quay lại đúng target cũ:
                     * đây là dao động do làm tròn subpixel.
                     */
                    if (
                        seenTargets.has(
                            targetKey
                        )
                    ) {
                        finishAtBestOffset(
                            "stable-repeated-target",
                            correctionCssY
                        );

                        return;
                    }

                    /*
                     * Sau ít nhất một lần dịch mà sai số không
                     * còn giảm thì giữ vị trí tốt nhất đã đo.
                     */
                    if (
                        correctionCount > 0 &&
                        improvementDevicePx <=
                        MIN_IMPROVEMENT_DEVICE_PX
                    ) {
                        finishAtBestOffset(
                            "stable-no-further-improvement",
                            correctionCssY
                        );

                        return;
                    }

                    seenTargets.add(
                        targetKey
                    );

                    previousErrorDevicePx =
                        errorDevicePx;

                    const changed =
                        applyAbsoluteOffset(
                            targetOffsetCssY
                        );

                    if (!changed) {
                        finishAtBestOffset(
                            "stable-subpixel-limit",
                            correctionCssY
                        );

                        return;
                    }

                    correctionCount += 1;

                    writeDebugMeasurements(
                        measurement,
                        {
                            batchNumber,
                            reasons,
                            correctionCount,
                            state:
                                "correction-applied",
                        }
                    );

                    /*
                     * Đo lại ở frame kế tiếp.
                     *
                     * Không có giới hạn vòng cứng.
                     * Điều kiện hội tụ bên trên tự quyết định dừng.
                     */
                    requestLocalFrame(
                        step
                    );
                }

                step();
            }
        );
    }

    function clearDebugAttributes() {
        const names = [
            "data-icon-offset-y",
            "data-icon-target",
            "data-align-run",
            "data-align-trigger",
            "data-align-state",
            "data-align-corrections",
            "data-pill-height",
            "data-text-top-to-frame-top",
            "data-text-bottom-to-frame-bottom",
            "data-text-height-from-frame-gaps",
            "data-icon-top-to-frame-top",
            "data-icon-bottom-to-frame-bottom",
            "data-icon-height-from-frame-gaps",
            "data-text-center-distance-from-frame-bottom",
            "data-icon-center-distance-from-frame-bottom",
            "data-icon-translate-y-correction",
            "data-device-pixel-ratio",
            "data-visual-viewport-scale",
        ];

        for (
            const name of
            names
        ) {
            svg.removeAttribute(
                name
            );
        }
    }

    function restoreOriginalState() {
        if (originalTransform) {
            svg.style.setProperty(
                "transform",
                originalTransform,
                originalTransformPriority
            );
        } else {
            svg.style.removeProperty(
                "transform"
            );
        }

        if (
            originalTransformOrigin
        ) {
            svg.style.setProperty(
                "transform-origin",
                originalTransformOrigin,
                originalTransformOriginPriority
            );
        } else {
            svg.style.removeProperty(
                "transform-origin"
            );
        }

        if (originalWillChange) {
            svg.style.setProperty(
                "will-change",
                originalWillChange,
                originalWillChangePriority
            );
        } else {
            svg.style.removeProperty(
                "will-change"
            );
        }

        restoreGraphicTransform();

        clearDebugAttributes();
    }

    instance = {
        pill,
        row,
        text,

        isConnected() {
            return (
                !destroyed &&
                pill.isConnected &&
                row.isConnected &&
                text.isConnected &&
                svg.isConnected &&
                graphic.isConnected &&
                bounds.isConnected &&
                measure.isConnected &&
                pill.contains(
                    text
                ) &&
                pill.contains(
                    svg
                ) &&
                svg.contains(
                    graphic
                ) &&
                svg.contains(
                    bounds
                ) &&
                svg.contains(
                    measure
                )
            );
        },

        hasGeometryChanged() {
            const signature =
                createGeometrySignature();

            return (
                !signature ||
                signature !==
                    lastGeometrySignature
            );
        },

        align,

        startWatching() {
            pill.__ordersMetaPillInstance =
                instance;

            row.__ordersMetaPillInstance =
                instance;

            text.__ordersMetaPillInstance =
                instance;

            sharedResizeObserver?.observe(
                pill
            );

            sharedResizeObserver?.observe(
                row
            );

            sharedResizeObserver?.observe(
                text
            );

            mutationObserver?.observe(
                text,
                {
                    childList: true,
                    characterData: true,
                    subtree: true,
                }
            );

            mutationObserver?.observe(
                pill,
                {
                    attributes: true,
                    attributeFilter: [
                        "class",
                        "style",
                    ],
                }
            );
        },

        destroy() {
            if (destroyed) {
                return;
            }

            destroyed = true;

            cancelActiveAlignment();

            sharedResizeObserver?.unobserve(
                pill
            );

            sharedResizeObserver?.unobserve(
                row
            );

            sharedResizeObserver?.unobserve(
                text
            );

            delete pill
                .__ordersMetaPillInstance;

            delete row
                .__ordersMetaPillInstance;

            delete text
                .__ordersMetaPillInstance;

            mutationObserver?.disconnect();

            restoreOriginalState();
        },
    };

    return instance;
}

/*
 * Hook chỉ cung cấp ref cho JSX trong orders_pill_pack.jsx.
 */
export function useAlignIconCenterToTextCenterFromFrameGaps(
    label
) {
    const pillRef =
        useRef(null);

    const rowRef =
        useRef(null);

    const textRef =
        useRef(null);

    const svgRef =
        useRef(null);

    const graphicRef =
        useRef(null);

    /*
     * Rect bounds là dữ liệu hình học bất biến.
     * Nó không được resize hoặc reposition bằng JavaScript.
     */
    const boundsRef =
        useRef(null);

    /*
     * Rect riêng dùng cho thuật toán đo.
     * Nó không nằm trong graphicRef và không bị dịch để sửa DevTools.
     */
    const measureRef =
        useRef(null);

    useLayoutEffect(() => {
        const pill =
            pillRef.current;

        const row =
            rowRef.current;

        const text =
            textRef.current;

        const svg =
            svgRef.current;

        const graphic =
            graphicRef.current;

        const bounds =
            boundsRef.current;

        const measure =
            measureRef.current;

        if (
            !pill ||
            !row ||
            !text ||
            !svg ||
            !graphic ||
            !bounds ||
            !measure
        ) {
            return undefined;
        }

        /*
         * graphicRef phải là group chọn ổn định trong DevTools:
         * group chỉ chứa đúng một rect bounds.
         *
         * Path/circle thật phải là sibling bên ngoài group.
         */
        if (
            !graphic.querySelector(
                "[data-orders-icon-art], [data-orders-icon-art-dot]"
            )
        ) {
            console.error(
                "[MetaPill] graphicRef phải chứa art thật của icon."
            );

            return undefined;
        }


        installSharedRuntime();

        const instance =
            createMetaPillAlignmentInstance({
                label,
                pill,
                row,
                text,
                svg,
                graphic,
                bounds,
                measure,
            });

        metaPillInstances.add(
            instance
        );

        instance.startWatching();

        /*
         * Tất cả pill mount trong cùng lượt render
         * được gom vào một batch duy nhất.
         */
        scheduleMetaPillAlignment({
            instance,
            reason:
                "initial-mount",
            immediate: true,
        });

        return () => {
            dirtyMetaPillInstances.delete(
                instance
            );

            metaPillInstances.delete(
                instance
            );

            instance.destroy();

            if (
                metaPillInstances.size ===
                0
            ) {
                uninstallSharedRuntime();
            }
        };
    }, [label]);

    return {
        pillRef,
        rowRef,
        textRef,
        svgRef,
        graphicRef,
        boundsRef,
        measureRef,
    };
}
