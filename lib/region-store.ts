"use client";

import { useSyncExternalStore } from "react";
import { REGION_KEY } from "@/lib/pickup-points";

/**
 * Вибрана область для смуги над шапкою.
 *
 * Сховище поза React, як і лічильник кошика: смуга живе в кореневому
 * layout, і читати куку там не можна — вона зробила б динамічними геть
 * усі сторінки, включно зі статичними, заради одного рядка тексту.
 * Тому значення тримаємо в localStorage і підписуємось на нього.
 */
let region: string | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function read(): string | null {
  try {
    return localStorage.getItem(REGION_KEY);
  } catch {
    /* Приватний режим або заблоковані дані сайту */
    return null;
  }
}

function emit() {
  for (const fn of listeners) fn();
}

/**
 * Підтягнути область за IP — лише коли свого вибору ще немає.
 *
 * Запитуємо один раз і зберігаємо результат: далі це вже «вибір
 * користувача», і ручна зміна в селекті його перекриває назавжди.
 * Дозволу браузера не питаємо — геодані дає хостинг із IP.
 */
let detecting = false;

export async function detectRegion() {
  if (detecting || getSnapshot()) return;
  detecting = true;

  try {
    /* Слеш обов'язковий: у конфізі trailingSlash, і без нього
       запит ішов би через зайвий редірект */
    const res = await fetch("/api/region/");
    if (!res.ok) return;
    const data: { region?: string | null } = await res.json();
    /* Поки запит ішов, користувач міг вибрати область сам — його вибір
       важливіший за здогадку за IP */
    if (data.region && !getSnapshot()) setRegion(data.region);
  } catch {
    /* Не визначили — смуга й далі питає область, як питала */
  }
}

export function setRegion(next: string) {
  region = next;
  loaded = true;
  try {
    localStorage.setItem(REGION_KEY, next);
  } catch {
    /* Не зберегли — вибір усе одно діє до перезавантаження */
  }
  emit();
}

function subscribe(fn: () => void) {
  listeners.add(fn);

  /* Область могли вибрати в сусідній вкладці — тоді смуга має оновитись */
  function onStorage(e: StorageEvent) {
    if (e.key !== REGION_KEY) return;
    region = e.newValue;
    emit();
  }
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  /* Читаємо один раз: getSnapshot викликається часто й мусить вертати
     те саме значення, поки нічого не змінилось */
  if (!loaded) {
    region = read();
    loaded = true;
  }
  return region;
}

/* На сервері вибору ще не видно — розмітка має збігтися з першим
   кадром клієнта, тож там область завжди невідома */
const getServerSnapshot = (): string | null => null;

export function useRegion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
