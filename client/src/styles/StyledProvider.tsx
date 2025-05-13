import React, { ReactNode } from "react";
import { ThemeProvider } from "styled-components/native";
import theme, { Theme } from "./theme";

interface StyledProviderProps {
  children: ReactNode;
}

const StyledProvider: React.FC<StyledProviderProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default StyledProvider;
