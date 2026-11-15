import type { PublicProduct } from "@estoreclub/app";

import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { photoUrl } from "../../lib/photo";
import { t } from "../../lib/strings";
import { colors } from "../../lib/theme";
import { Photo } from "../Photo";

/**
 * Every photo of a product, a swipe apart, on the grey they are shot on - the website's
 * gallery, with dots under it instead of thumbnails. One photo: no dots, nothing to swipe.
 */
export function Gallery({
  media,
  width,
  height,
  faded,
}: {
  media: PublicProduct["media"];
  width: number;
  height: number;
  /** Sold out: the photos fade, as the card's does. */
  faded?: boolean;
}) {
  const photos = (media ?? []).filter(
    (item) => item && item.url && item.type !== "video",
  );
  const [shown, setShown] = useState(0);
  const inset = 32;

  return (
    <View style={[styles.box, { width, height }]}>
      <ScrollView
        horizontal
        pagingEnabled
        scrollEventThrottle={32}
        showsHorizontalScrollIndicator={false}
        onScroll={(event) =>
          setShown(Math.round(event.nativeEvent.contentOffset.x / width))
        }
      >
        {(photos.length > 0 ? photos : [null]).map((photo, index) => (
          <View
            key={photo?.url ?? index}
            accessibilityLabel={t("gallery.photo", {
              n: index + 1,
              count: Math.max(1, photos.length),
            })}
            style={[
              styles.page,
              { width, height },
              faded ? styles.faded : null,
            ]}
          >
            <Photo
              contain
              fadeDuration={0}
              height={height - inset * 2}
              uri={photo ? photoUrl([photo], width) : null}
              width={width - inset * 2}
            />
          </View>
        ))}
      </ScrollView>
      {photos.length > 1 ? (
        <View style={styles.dots}>
          {photos.map((photo, index) => (
            <View
              key={photo.url}
              style={[styles.dot, index === shown ? styles.dotOn : null]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.tile },
  page: { alignItems: "center", justifyContent: "center" },
  faded: { opacity: 0.55 },
  dots: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(17, 18, 22, 0.2)",
  },
  dotOn: { width: 18, backgroundColor: colors.ink },
});
