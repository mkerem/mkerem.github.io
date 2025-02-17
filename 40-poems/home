import React, { useState, useEffect } from 'react';

const VintageFrame = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
    <rect x="40" y="40" width="420" height="420" 
          stroke="currentColor" 
          fill="none" 
          strokeWidth="2"
          className="text-yellow-500 opacity-40" />
    <rect x="50" y="50" width="400" height="400" 
          stroke="currentColor" 
          fill="none" 
          strokeWidth="1"
          className="text-yellow-500 opacity-30" />
    
    {/* Subtle corner flourishes */}
    <g className="text-yellow-500 opacity-40">
      {/* Top Left */}
      <path d="M 35 35 L 75 35 M 35 35 L 35 75" stroke="currentColor" fill="none" strokeWidth="1"/>
      {/* Top Right */}
      <path d="M 465 35 L 425 35 M 465 35 L 465 75" stroke="currentColor" fill="none" strokeWidth="1"/>
      {/* Bottom Left */}
      <path d="M 35 465 L 75 465 M 35 465 L 35 425" stroke="currentColor" fill="none" strokeWidth="1"/>
      {/* Bottom Right */}
      <path d="M 465 465 L 425 465 M 465 465 L 465 425" stroke="currentColor" fill="none" strokeWidth="1"/>
    </g>
  </svg>
);

const PoemBook = () => {
  const [currentPoem, setCurrentPoem] = useState(null);
  const [showBirthdayPoem, setShowBirthdayPoem] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const poems = [
    {
      id: 1,
      title: "The Gospel of GORGE",
      content: "Some say \"divine,\" some say \"grand,\"\nWe say \"gorge\" with a flourish of hand.\nGorge is a lifestyle, a mantra, a creed,\nA state of mind for those who succeed."
    },
    {
      id: 2,
      title: "No Dreams Are Off Any Tables",
      content: "No dream too wild, no path too steep,\nNo thought too vast for us to keep.\nYou stack them high—why play it small?\nMove to Europe, build it all.\n\nWith a spray of lavender, calming the mind,\nInhale the peace, leave stress behind.\nFleur du Lavender, a mist so pure,\nDreams flow freely, calm and sure."
    }
  ];

  const birthdayPoem = {
    id: 40,
    title: "Forty",
    content: "Dacia at forty—strong, untamed,\nA life well-lived, a queen well-named.\nNo dreams delayed, no path too steep,\nShe moves with power, bold and deep.\nA mystic, a force, wild and free,\nExactly where she's meant to be."
  };

  const getRandomPoem = () => {
    const randomIndex = Math.floor(Math.random() * poems.length);
    return poems[randomIndex];
  };

  const handleNewPoem = () => {
    setIsTransitioning(true);
    setIsOpen(false);
    setTimeout(() => {
      setCurrentPoem(getRandomPoem());
      setIsOpen(true);
      setIsTransitioning(false);
    }, 600);
  };

  const handleBirthdayPoem = () => {
    setIsTransitioning(true);
    setIsOpen(false);
    setTimeout(() => {
      setShowBirthdayPoem(true);
      setCurrentPoem(birthdayPoem);
      setIsOpen(true);
      setIsTransitioning(false);
    }, 600);
  };

  useEffect(() => {
    handleNewPoem();
  }, []);

  return (
    <div className="min-h-screen bg-emerald-900 p-6 flex flex-col items-center justify-center">
      <div className="w-[600px] h-[600px] bg-emerald-800 border border-yellow-500/20 rounded-lg shadow-2xl relative flex items-center justify-center px-16">
        <VintageFrame />
        
        {/* Poetry Content */}
        <div className={`text-center transition-all duration-500 ${isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {currentPoem && (
            <>
              <h2 className="text-2xl font-montserrat mb-6 text-yellow-500 tracking-wide">{currentPoem.title}</h2>
              <p className="text-lg text-yellow-100/90 whitespace-pre-line leading-relaxed font-poppins">
                {currentPoem.content}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center items-center space-x-4 mt-8">
        <button
          onClick={handleNewPoem}
          className="px-6 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-lg transition-colors duration-200 font-poppins tracking-wide"
        >
          Turn Page
        </button>

        <div className="flex space-x-2 text-yellow-500 font-poppins">
          <button 
            onClick={() => {
              setIsTransitioning(true);
              setIsOpen(false);
              setTimeout(() => {
                setCurrentPoem(poems[1]);
                setIsOpen(true);
                setIsTransitioning(false);
              }, 600);
            }} 
            className="hover:text-yellow-300 transition-colors">2</button>
          <span>/</span>
          <button onClick={() => setCurrentPoem(poems[19])} className="hover:text-yellow-300 transition-colors">20</button>
          <span>/</span>
          <button onClick={() => setCurrentPoem(poems[24])} className="hover:text-yellow-300 transition-colors">25</button>
        </div>
        
        {!showBirthdayPoem && (
          <button
            onClick={handleBirthdayPoem}
            className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg transition-colors duration-200"
          >
            🎂
          </button>
        )}
      </div>
    </div>
  );
};

export default PoemBook;