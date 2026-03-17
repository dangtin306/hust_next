"use client";

import navConfigRaw from "@/app_structure/tabs_nav/navConfig.json";
import { TabsUiFrame, TabsUiItem } from "../../../../react_app/src/app_structure/tabs_nav/tabs_ui.jsx";
import { useState } from "react";

type SlugValue = string | string[] | undefined;

type NavNode = {
  slug_1?: SlugValue;
  slug_2?: SlugValue;
  slug_3?: SlugValue;
  slug_4?: SlugValue;
  label?: Record<string, string>;
  path?: string;
  children?: NavNode[];
};

type NavCategory = {
  category?: string;
  items?: NavNode[];
};

const navConfig = navConfigRaw as NavCategory[];

const matchesSlug = (configValue: SlugValue, currentValue: string) => {
  if (!configValue) return false;
  if (Array.isArray(configValue)) return configValue.includes(currentValue);
  return configValue === currentValue;
};

const pickLabel = (label?: Record<string, string>, lang = "en") => {
  if (!label) return "";
  return label[lang] || label.en || label.vi || "";
};

const isEmptySlug = (value: unknown) => value === null || value === undefined || value === "";

const matchesChildSlug = (child: NavNode, currentValue: string, fallbackValue: string) => {
  if (!isEmptySlug(child.slug_2) && matchesSlug(child.slug_2, currentValue)) return true;
  if (!isEmptySlug(child.slug_1) && matchesSlug(child.slug_1, currentValue)) return true;
  if (!isEmptySlug(child.slug_1) && !isEmptySlug(fallbackValue) && matchesSlug(child.slug_1, fallbackValue)) {
    return true;
  }
  return false;
};

const getItemKey = (item: NavNode, idx: number) =>
  Array.isArray(item.slug_1) ? item.slug_1.join("|") : String(item.slug_1 ?? idx);

const getChildKey = (child: NavNode, idx: number) =>
  String(child.slug_2 ?? child.slug_1 ?? child.path ?? idx);

const getSubKey = (sub: NavNode, idx: number) => String(sub.slug_3 ?? sub.slug_2 ?? sub.path ?? idx);

const getSub2Key = (sub2: NavNode, idx: number) => String(sub2.slug_4 ?? sub2.slug_3 ?? sub2.path ?? idx);

type ProfileNavProps = {
  slug: string;
};

export default function ProfileNav({ slug }: ProfileNavProps) {
  const categoryConfig = navConfig.find((cat) => cat.category === "mmo_p2p_shop");
  const items = categoryConfig?.items || [];

  const [activeSlug1, setActiveSlug1] = useState("product");
  const [activeSlug2, setActiveSlug2] = useState("play");
  const [activeSlug3, setActiveSlug3] = useState("");
  const [activeSlug4, setActiveSlug4] = useState("");

  const pickPrimarySlug = (value?: SlugValue) => {
    if (Array.isArray(value)) return String(value[0] || "");
    return String(value || "");
  };

  const redirectToPath = (path?: string) => {
    if (!path) return;
    if (path.startsWith("http")) {
      window.open(path, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.href = path;
  };

  const clickLevel1 = (item: NavNode) => {
    const nextSlug1 = pickPrimarySlug(item.slug_1);
    const firstChild = item.children?.[0];
    const nextSlug2 = firstChild ? pickPrimarySlug(firstChild.slug_2 ?? firstChild.slug_1) : "";
    setActiveSlug1(nextSlug1);
    setActiveSlug2(nextSlug2);
    setActiveSlug3("");
    setActiveSlug4("");
    if (item.path) {
      redirectToPath(item.path);
    } else if (firstChild?.path) {
      redirectToPath(firstChild.path);
    }
  };

  const clickLevel2 = (child: NavNode) => {
    const nextSlug2 = pickPrimarySlug(child.slug_2 ?? child.slug_1);
    setActiveSlug2(nextSlug2);
    setActiveSlug3("");
    setActiveSlug4("");
    if (child.path) {
      redirectToPath(child.path);
    } else if (child.children?.[0]?.path) {
      redirectToPath(child.children[0].path);
    }
  };

  const clickLevel3 = (sub: NavNode) => {
    const nextSlug3 = pickPrimarySlug(sub.slug_3);
    const nextSlug2 = pickPrimarySlug(sub.slug_2);
    if (nextSlug2) {
      setActiveSlug2(nextSlug2);
      setActiveSlug3("");
    } else {
      setActiveSlug3(nextSlug3);
    }
    setActiveSlug4("");
    redirectToPath(sub.path);
  };

  const clickLevel4 = (sub2: NavNode) => {
    const nextSlug4 = pickPrimarySlug(sub2.slug_4);
    const nextSlug3 = pickPrimarySlug(sub2.slug_3);
    if (nextSlug3) setActiveSlug3(nextSlug3);
    setActiveSlug4(nextSlug4);
    redirectToPath(sub2.path);
  };

  const isSubActive = (sub: NavNode) => {
    if (!isEmptySlug(sub.slug_3)) return matchesSlug(sub.slug_3, activeSlug3);
    if (!isEmptySlug(sub.slug_2)) return matchesSlug(sub.slug_2, activeSlug2);
    if (!isEmptySlug(activeSlug3)) return false;
    return matchesSlug(sub.slug_3, activeSlug3);
  };

  const isSub2Active = (sub2: NavNode) => {
    if (!isEmptySlug(sub2.slug_4)) return matchesSlug(sub2.slug_4, activeSlug4);
    if (!isEmptySlug(sub2.slug_3)) return matchesSlug(sub2.slug_3, activeSlug3);
    return false;
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-4" data-product-slug={slug}>
      <TabsUiFrame>
        <div className="flex space-x-4 justify-center">
          {items.map((item, idx) => (
            <TabsUiItem
              key={getItemKey(item, idx)}
              active={matchesSlug(item.slug_1, activeSlug1)}
              label={pickLabel(item.label, "en")}
              onClick={() => clickLevel1(item)}
            />
          ))}
        </div>

        {items.map((item, idx) =>
          item.children && matchesSlug(item.slug_1, activeSlug1) ? (
            <div key={`${getItemKey(item, idx)}-lv2`} className="flex flex-col space-y-2 mt-2 items-center w-full">
              <div className="flex space-x-4 justify-center w-full">
                {item.children.map((child, childIdx) => (
                  <TabsUiItem
                    key={getChildKey(child, childIdx)}
                    active={matchesChildSlug(child, activeSlug2, activeSlug1)}
                    label={pickLabel(child.label, "en")}
                    onClick={() => clickLevel2(child)}
                  />
                ))}
              </div>

              {item.children.map((child, childIdx) =>
                child.children && matchesChildSlug(child, activeSlug2, activeSlug1) ? (
                  <div key={`${getChildKey(child, childIdx)}-lv3`} className="flex flex-col space-y-2 mt-2 items-center w-full">
                    <div className="flex space-x-4 justify-center w-full">
                      {child.children.map((sub, subIdx) => (
                        <TabsUiItem
                          key={getSubKey(sub, subIdx)}
                          active={isSubActive(sub)}
                          label={pickLabel(sub.label, "en")}
                          onClick={() => clickLevel3(sub)}
                        />
                      ))}
                    </div>

                    {child.children.map((sub, subIdx) =>
                      sub.children && isSubActive(sub) ? (
                        <div key={`${getSubKey(sub, subIdx)}-lv4`} className="flex space-x-4 mt-2 justify-center w-full">
                          {sub.children.map((sub2, sub2Idx) => (
                            <TabsUiItem
                              key={getSub2Key(sub2, sub2Idx)}
                              active={isSub2Active(sub2)}
                              label={pickLabel(sub2.label, "en")}
                              onClick={() => clickLevel4(sub2)}
                            />
                          ))}
                        </div>
                      ) : null
                    )}
                  </div>
                ) : null
              )}
            </div>
          ) : null
        )}
      </TabsUiFrame>
    </div>
  );
}
