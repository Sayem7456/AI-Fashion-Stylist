
import React, { useState, useCallback } from 'react';
import { AppState, AnalysisResult, ColorPalette, LoadingStates } from './types';
import { analyzeFaceAndColors, generateHairstyles, generateOutfit } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import HairstyleSuggestions from './components/HairstyleSuggestions';
import ColorPalettes from './components/ColorPalettes';
import LoadingSpinner from './components/LoadingSpinner';
import { SparklesIcon } from './components/icons/SparklesIcon';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Initial);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [hairstyles, setHairstyles] = useState<string[]>([]);
  const [outfitImage, setOutfitImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingStates>({
    isAnalyzing: false,
    isGeneratingHairstyles: false,
    isGeneratingOutfit: false,
  });

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      resetToInitial();
    };
    reader.readAsDataURL(file);
  };

  const resetToInitial = () => {
    setAppState(AppState.Initial);
    setAnalysisResult(null);
    setHairstyles([]);
    setOutfitImage(null);
    setError(null);
  }

  const handleAnalyze = useCallback(async () => {
    if (!uploadedImage) return;

    setAppState(AppState.Analyzing);
    setError(null);
    setLoading({ isAnalyzing: true, isGeneratingHairstyles: true, isGeneratingOutfit: false });

    try {
      const base64Data = uploadedImage.split(',')[1];
      const analysis = await analyzeFaceAndColors(base64Data);
      setAnalysisResult(analysis);
      setLoading(prev => ({ ...prev, isAnalyzing: false }));

      const generatedHairstyles = await generateHairstyles(base64Data, analysis.faceShape, analysis.gender);
      setHairstyles(generatedHairstyles);
      
      setAppState(AppState.Results);
    } catch (err) {
      console.error(err);
      setError('An error occurred during analysis. Please try again.');
      setAppState(AppState.Initial);
    } finally {
      setLoading({ isAnalyzing: false, isGeneratingHairstyles: false, isGeneratingOutfit: false });
    }
  }, [uploadedImage]);

  const handleTryOnOutfit = useCallback(async (palette: ColorPalette) => {
    if (!uploadedImage || !analysisResult) return;

    setLoading(prev => ({ ...prev, isGeneratingOutfit: true }));
    setError(null);
    setOutfitImage(null);

    try {
      const base64Data = uploadedImage.split(',')[1];
      const image = await generateOutfit(base64Data, palette, analysisResult.gender);
      setOutfitImage(image);
    } catch (err) {
      console.error(err);
      setError('Could not generate the outfit. Please try another palette.');
    } finally {
      setLoading(prev => ({ ...prev, isGeneratingOutfit: false }));
    }
  }, [uploadedImage, analysisResult]);

  const isLoading = loading.isAnalyzing || loading.isGeneratingHairstyles;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 flex items-center justify-center gap-3">
          <SparklesIcon />
          AI Fashion Stylist
        </h1>
        <p className="text-gray-400 mt-2">Upload your photo to discover your perfect look.</p>
      </header>

      <main className="w-full max-w-5xl">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
          <ImageUploader onImageUpload={handleImageUpload} uploadedImage={uploadedImage} />

          {uploadedImage && appState === AppState.Initial && (
            <div className="mt-6 text-center">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze My Style
              </button>
            </div>
          )}
          
          {appState === AppState.Analyzing && (
            <div className="mt-8 text-center">
              <LoadingSpinner />
              <p className="mt-4 text-lg text-gray-300 animate-pulse">
                {loading.isAnalyzing ? "Analyzing face shape and colors..." : "Generating hairstyle suggestions..."}
              </p>
            </div>
          )}

          {error && <p className="mt-4 text-center text-red-400">{error}</p>}
          
          {appState === AppState.Results && analysisResult && (
            <div className="mt-8 space-y-12">
              <HairstyleSuggestions hairstyles={hairstyles} faceShape={analysisResult.faceShape} loading={loading.isGeneratingHairstyles} />
              <ColorPalettes 
                palettes={analysisResult.colorPalettes} 
                onTryOn={handleTryOnOutfit} 
                loading={loading.isGeneratingOutfit}
                outfitImage={outfitImage}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;