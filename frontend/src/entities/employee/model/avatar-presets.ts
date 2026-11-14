import dragonFruit from "@/shared/resources/01_dragon_fruit.png";
import boyBrownHair from "@/shared/resources/02_boy_brown_hair.png";
import girlPurpleHair from "@/shared/resources/03_girl_purple_hair.png";
import manBeard from "@/shared/resources/04_man_beard.png";
import womanEarrings from "@/shared/resources/05_woman_earrings.png";
import girlBrownHair from "@/shared/resources/06_girl_brown_hair.png";
import manGlasses from "@/shared/resources/07_man_glasses.png";
import manCharacter from "@/shared/resources/08_man_character.png";
import coconut from "@/shared/resources/09_coconut.png";
import carrot from "@/shared/resources/10_carrot.png";
import grapes from "@/shared/resources/11_grapes.png";
import redPepper from "@/shared/resources/12_red_pepper.png";
import greenApple from "@/shared/resources/13_green_apple.png";
import pear from "@/shared/resources/14_pear.png";
import pineapple from "@/shared/resources/15_pineapple.png";
import blondeGirl from "@/shared/resources/16_blonde_girl.png";

export const AVATAR_PRESETS = [
  { id: "01_dragon_fruit", label: "Питайя", src: dragonFruit },
  { id: "02_boy_brown_hair", label: "Мальчик", src: boyBrownHair },
  { id: "03_girl_purple_hair", label: "Девочка", src: girlPurpleHair },
  { id: "04_man_beard", label: "Борода", src: manBeard },
  { id: "05_woman_earrings", label: "Серьги", src: womanEarrings },
  { id: "06_girl_brown_hair", label: "Девушка", src: girlBrownHair },
  { id: "07_man_glasses", label: "Очки", src: manGlasses },
  { id: "08_man_character", label: "Мужчина", src: manCharacter },
  { id: "09_coconut", label: "Кокос", src: coconut },
  { id: "10_carrot", label: "Морковь", src: carrot },
  { id: "11_grapes", label: "Виноград", src: grapes },
  { id: "12_red_pepper", label: "Перец", src: redPepper },
  { id: "13_green_apple", label: "Яблоко", src: greenApple },
  { id: "14_pear", label: "Груша", src: pear },
  { id: "15_pineapple", label: "Ананас", src: pineapple },
  { id: "16_blonde_girl", label: "Блондинка", src: blondeGirl },
] as const;

export type AvatarPresetId = (typeof AVATAR_PRESETS)[number]["id"];

export function presetAvatarSrc(id: string | null | undefined): string | null {
  if (!id) return null;
  return AVATAR_PRESETS.find((item) => item.id === id)?.src ?? null;
}
