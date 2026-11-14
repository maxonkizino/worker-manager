package com.taskflow.user.domain;

import java.util.Set;

public final class AvatarPresets {

    public static final Set<String> IDS = Set.of(
            "01_dragon_fruit",
            "02_boy_brown_hair",
            "03_girl_purple_hair",
            "04_man_beard",
            "05_woman_earrings",
            "06_girl_brown_hair",
            "07_man_glasses",
            "08_man_character",
            "09_coconut",
            "10_carrot",
            "11_grapes",
            "12_red_pepper",
            "13_green_apple",
            "14_pear",
            "15_pineapple",
            "16_blonde_girl");

    private AvatarPresets() {}

    public static boolean isKnown(String id) {
        return id != null && IDS.contains(id);
    }
}
