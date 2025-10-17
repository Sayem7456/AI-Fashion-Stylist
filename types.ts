
export interface ColorPalette {
  name: string;
  colors: string[];
}

export interface AnalysisResult {
  faceShape: string;
  gender: string;
  colorPalettes: ColorPalette[];
}

export enum AppState {
  Initial = 'Initial',
  Analyzing = 'Analyzing',
  Results = 'Results',
}

export interface LoadingStates {
  isAnalyzing: boolean;
  isGeneratingHairstyles: boolean;
  isGeneratingOutfit: boolean;
}