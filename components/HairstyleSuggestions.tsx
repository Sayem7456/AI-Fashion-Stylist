import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface HairstyleSuggestionsProps {
  hairstyles: string[];
  faceShape: string;
  loading: boolean;
}

const HairstyleSuggestions: React.FC<HairstyleSuggestionsProps> = ({ hairstyles, faceShape, loading }) => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-center mb-2">Hairstyle Suggestions</h2>
      <p className="text-center text-gray-400 mb-6">Based on your <span className="font-semibold text-purple-300">{faceShape}</span> face shape, here are some looks for you.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {(loading ? Array(4).fill(null) : hairstyles).map((hairstyle, index) => (
          <div key={index} className="relative group aspect-square bg-gray-700/50 rounded-lg overflow-hidden shadow-lg animate-fade-in">
            {hairstyle ? (
              <>
                <img src={hairstyle} alt={`Hairstyle suggestion ${index + 1}`} className="w-full h-full object-cover" />
                <a
                  href={hairstyle}
                  download={`hairstyle-suggestion-${index + 1}.png`}
                  className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  aria-label={`Download hairstyle suggestion ${index + 1}`}
                  title="Download Image"
                >
                  <DownloadIcon />
                </a>
              </>
            ) : (
              <div className="w-full h-full bg-gray-700 animate-pulse"></div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HairstyleSuggestions;
