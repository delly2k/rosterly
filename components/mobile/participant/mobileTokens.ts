/** Shared mobile participant UI tokens */
export const MOBILE_PAGE_PADDING = 16;
export const MOBILE_CARD_RADIUS = 14;
export const MOBILE_BTN_RADIUS = 10;
export const MOBILE_BTN_MIN_HEIGHT = 48;
export const MOBILE_TITLE_SIZE = 17;
export const MOBILE_HEADING_SIZE = 18;
export const MOBILE_BODY_SIZE = 14;
export const MOBILE_LABEL_SIZE = 12;

export const mobilePageStyle: React.CSSProperties = {
  background: "var(--color-page)",
  minHeight: "100vh",
};

export const mobileCardStyle: React.CSSProperties = {
  background: "white",
  border: "0.5px solid var(--color-border)",
  borderRadius: MOBILE_CARD_RADIUS,
};

export const mobilePrimaryBtnStyle: React.CSSProperties = {
  minHeight: MOBILE_BTN_MIN_HEIGHT,
  borderRadius: MOBILE_BTN_RADIUS,
  fontSize: MOBILE_BODY_SIZE,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  width: "100%",
};
