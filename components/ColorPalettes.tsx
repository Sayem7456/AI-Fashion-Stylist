import React from 'react';
import { ColorPalette } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { DownloadIcon } from './icons/DownloadIcon';

interface ColorPalettesProps {
  palettes: ColorPalette[];
  onTryOn: (palette: ColorPalette) => void;
  loading: boolean;
  outfitImage: string | null;
}

const ColorPalettes: React.FC<ColorPalettesProps> = ({ palettes, onTryOn, loading, outfitImage }) => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-center mb-6">Your Perfect Color Palettes</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 space-y-4">
          {palettes.map((palette, index) => (
            <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{palette.name}</h3>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {palette.colors.map((color, cIndex) => (
                    <div
                      key={cIndex}
                      className="w-8 h-8 rounded-full border-2 border-gray-500"
                      style={{ backgroundColor: color }}
                      title={color}
                    ></div>
                  ))}
                </div>
                <button
                  onClick={() => onTryOn(palette)}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-full hover:bg-purple-700 transition-colors disabled:bg-gray-500"
                >
                  Try On
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="relative group md:w-1/2 aspect-square bg-gray-700/50 rounded-lg flex items-center justify-center overflow-hidden shadow-lg">
          {loading ? (
            <div>
              <LoadingSpinner />
              <p className="mt-2 text-sm text-gray-400">Generating outfit...</p>
            </div>
          ) : outfitImage ? (
            <>
              <img src={outfitImage} alt="Virtual outfit try-on" className="w-full h-full object-cover animate-fade-in" />
              <a
                href={outfitImage}
                download="outfit-try-on.png"
                className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                aria-label="Download outfit image"
                title="Download Image"
              >
                <DownloadIcon />
              </a>
            </>
          ) : (
            <p className="text-gray-400 text-center p-4">Select a palette to see a virtual try-on of an outfit.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ColorPalettes;
