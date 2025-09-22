
import React from 'react';
import HeroBanner from '@/modules/home/components/heroBanner';
import FeaturedDestinations from '@/modules/home/components/FeaturedDestinations'; 
import FeaturedNews from '@/modules/home/components/FeaturedNews';

const Home: React.FC = () => {
  return (
    <main>
      <HeroBanner />
      <FeaturedDestinations />
      <FeaturedNews />
    </main>
  );
};

export default Home;