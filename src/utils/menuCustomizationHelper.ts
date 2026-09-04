import { MenuItem } from 'menu-items';
import { IMenuCustomizationSettings } from 'store/customizationStore';

/**
 * Reorders and filters an array of items according to a saved order and hidden list.
 * CRITICAL RULE: If a new item is detected that was not present in the saved order,
 * it is placed at the VERY TOP (beginning) of the list and is guaranteed to be visible!
 */
export function applyItemOrdering<T extends { id: string }>(
  items: T[],
  savedOrder?: string[],
  hiddenIds?: string[]
): T[] {
  if (!items || items.length === 0) return [];

  const hiddenSet = new Set(hiddenIds || []);
  const itemMap = new Map<string, T>();
  items.forEach((item) => itemMap.set(item.id, item));

  // Agar foydalanuvchi hali hech qanday tartib saqlamagan bo'lsa
  if (!savedOrder || savedOrder.length === 0) {
    return items.filter((item) => !hiddenSet.has(item.id));
  }

  const savedOrderSet = new Set(savedOrder);

  // 1. Yangi qo'shilgan elementlar: codebase da bor, lekin savedOrder da hali yo'q
  // TALAB: Yangi menyu qo'shilsa default holatda yuqoridan qo'yilib, ko'rinadigan qilinadi.
  const newItems = items.filter((item) => !savedOrderSet.has(item.id));

  // 2. Saqlangan tartibdagi mavjud elementlar (faqat yashirilmaganlari)
  const existingOrderedItems: T[] = [];
  savedOrder.forEach((id) => {
    const item = itemMap.get(id);
    if (item && !hiddenSet.has(id)) {
      existingOrderedItems.push(item);
    }
  });

  return [...newItems, ...existingOrderedItems];
}

/**
 * Applies customization to the entire menu items structure:
 * - Sorts/filters top-level groups
 * - Sorts/filters child items within each group
 */
export function getCustomizedMenuItems(
  originalGroups: MenuItem[],
  settings?: IMenuCustomizationSettings
): MenuItem[] {
  if (!originalGroups || originalGroups.length === 0) return [];
  if (!settings) return originalGroups;

  // 1. Guruhlarni tartiblash va yashirilganlarini chiqarib tashlash
  const orderedGroups = applyItemOrdering(
    originalGroups,
    settings.groupOrder,
    settings.hiddenGroups
  );

  // 2. Har bir guruh ichidagi children elementlarni tartiblash va yashirish
  return orderedGroups.map((group) => {
    if (!group.children || group.children.length === 0) {
      return group;
    }

    const groupCustomization = settings.itemsByGroup?.[group.id];
    const orderedChildren = applyItemOrdering(
      group.children,
      groupCustomization?.order,
      groupCustomization?.hidden
    );

    return {
      ...group,
      children: orderedChildren
    };
  });
}
