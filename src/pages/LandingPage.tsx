import React from 'react';
import { useNavigate } from 'react-router-dom';
import tavernBackground from '@/assets/tavern-background.jpg';
import { Button } from '@/components/ui/button';

const fantasyFont = {
  fontFamily: 'Cinzel, serif',
  letterSpacing: '0.05em',
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative bg-black"
      style={{ backgroundImage: `url(${tavernBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Overlay for fantasy effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-yellow-900/60 z-0" />
      {/* Title and subtitle */}
      <div className="absolute left-0 top-0 w-2/3 h-full flex flex-col justify-center pl-16 z-10">
        <h1
          className="text-6xl md:text-7xl font-bold text-gold drop-shadow-lg mb-6"
          style={fantasyFont}
        >
          Dungeons & Dragons
        </h1>
        <p className="text-2xl md:text-3xl text-parchment drop-shadow-md mb-8 max-w-xl" style={fantasyFont}>
          Welcome, adventurer! Begin your journey by creating a hero, editing your party, or entering the arena for glorious combat.
        </p>
      </div>
      {/* Right panel menu */}
      <div className="absolute right-0 top-0 h-full flex flex-col justify-center items-end pr-16 z-10">
        <div className="bg-wood-dark/80 border-4 border-gold rounded-2xl shadow-2xl p-8 flex flex-col gap-8 min-w-[320px]">
          <Button
            className="w-full py-6 text-2xl font-bold bg-gradient-gold text-background hover:shadow-glow-gold rounded-xl border-2 border-copper transition-all duration-200"
            style={fantasyFont}
            onClick={() => navigate('/create')}
          >
            Create New Character
          </Button>
          <Button
            className="w-full py-6 text-2xl font-bold bg-gradient-copper text-background hover:shadow-glow-copper rounded-xl border-2 border-gold transition-all duration-200"
            style={fantasyFont}
            onClick={() => navigate('/character/1')}
          >
            Edit Characters
          </Button>
          <Button
            className="w-full py-6 text-2xl font-bold bg-gradient-wood text-parchment hover:shadow-glow-gold rounded-xl border-2 border-copper transition-all duration-200"
            style={fantasyFont}
            onClick={() => navigate('/combat')}
          >
            Enter Combat
          </Button>
        </div>
      </div>
      {/* Fantasy sparkles or animated effect (optional, can be improved with a canvas or particles lib) */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Add fantasy sparkles or animated SVGs here if desired */}
      </div>
    </div>
  );
}

