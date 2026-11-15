import { LayoutAnimation } from "react-native";

/**
 * Animates the next change on screen: what goes fades out, what comes fades in, and what stays
 * glides to its new place. Called just before the state that changes the layout.
 */
export function animateFold() {
  LayoutAnimation.configureNext(
    LayoutAnimation.create(260, "easeInEaseOut", "opacity"),
  );
}
