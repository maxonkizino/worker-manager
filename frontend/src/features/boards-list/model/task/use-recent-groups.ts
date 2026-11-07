import { ApiSchemas } from "@/shared/api/schema";

type BoardsGroup = {
  title: string;
  items: ApiSchemas["Board"][];
};

export function useRecentGroups(boards: ApiSchemas["Board"][]): BoardsGroup[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const groups = boards.reduce<BoardsGroup[]>((acc, board) => {
    const lastOpenedAt = new Date(board.lastOpenedAt);
    lastOpenedAt.setHours(0, 0, 0, 0);

    let groupTitle: string;
    if (lastOpenedAt.getTime() === today.getTime()) {
      groupTitle = "Сегодня";
    } else if (lastOpenedAt.getTime() === yesterday.getTime()) {
      groupTitle = "Вчера";
    } else if (lastOpenedAt >= lastMonth) {
      groupTitle = "Прошлый месяц";
    } else {
      groupTitle = "Другое";
    }

    const group = acc.find((g) => g.title === groupTitle);
    if (group) {
      group.items.push(board);
    } else {
      acc.push({ title: groupTitle, items: [board] });
    }

    return acc;
  }, []);

  // Сортируем группы в нужном порядке
  const groupOrder = ["Сегодня", "Вчера", "Прошлый месяц", "Другое"];
  return groupOrder
    .map((title) => groups.find((g) => g.title === title))
    .filter((group): group is BoardsGroup => group !== undefined);
}
