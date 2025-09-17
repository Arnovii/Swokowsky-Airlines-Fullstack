
import React from 'react';
import HeroBanner from '@/modules/home/components/heroBanner';
import FeaturedDestinations from '@/modules/home/components/FeaturedDestinations'; 

const Home: React.FC = () => {
  return (
    <main>
      <HeroBanner />
      <FeaturedDestinations />
    </main>
  );
};

export default Home;