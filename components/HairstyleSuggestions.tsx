
import React from 'react';

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
          <div key={index} className="aspect-square bg-gray-700/50 rounded-lg overflow-hidden shadow-lg animate-fade-in">
            {hairstyle ? (
              <img src={hairstyle} alt={`Hairstyle suggestion ${index + 1}`} className="w-full h-full object-cover" />
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
