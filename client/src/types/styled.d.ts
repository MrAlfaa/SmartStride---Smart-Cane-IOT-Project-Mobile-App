import 'styled-components/native';
import { Theme } from '../styles/theme';

// Extend the styled-components DefaultTheme
declare module 'styled-components/native' {
  export interface DefaultTheme extends Theme {}
}