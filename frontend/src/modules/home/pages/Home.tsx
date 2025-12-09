
import React from 'react';
import HeroBanner from '../components/heroBanner';
import FeaturedDestinations from '../components/FeaturedDestinations'; 
import FeaturedNews from '../components/FeaturedNews';

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