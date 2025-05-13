const theme = {
  colors: {
    primary: "#2196F3",
    secondary: "#FF9800",
    background: "#FFFFFF",
    text: "#212121",
    textSecondary: "#757575",
    error: "#F44336",
    success: "#4CAF50",
    warning: "#FFC107",
    info: "#2196F3",
    disabled: "#BDBDBD",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
    round: 999,
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeights: {
    regular: "400",
    medium: "500",
    bold: "700",
  }
};

export type Theme = typeof theme;
export default theme;
