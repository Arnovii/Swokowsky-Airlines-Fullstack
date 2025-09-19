import React from "react";

const FeaturedDestinations = () => {
  const destinations = [
    {
      id: 1,
      name: "Nueva York",
      image:
        "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop",
      class: "Clase Económica",
      price: "4.500.000",
    },
    {
      id: 2,
      name: "Madrid",
      image:
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=2070&auto=format&fit=crop",
      class: "Clase Económica",
      price: "8.000.000",
    },
    {
      id: 3,
      name: "Miami",
      image:
        "https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      class: "Clase Económica",
      price: "3.800.000",
    },
  ];

  return (
    <section className="bg-white py-12 px-4 md:px-8 font-sans">
      <div className="container mx-auto">
        {/* Título */}
        <div className="text-center mb-10">
          <h2 className="text-3xl tracking-wide font-sans text-gray-800">
            Destinos Destacados
          </h2>
        </div>

        {/* Grid de destinos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="relative rounded-xl overflow-hidden shadow-xl transform transition duration-500 hover:scale-105 cursor-pointer group"
            >
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Caja blanca sobre la imagen */}
              <div className="absolute bottom-4 left-4 right-4 bg-white p-5 rounded-lg shadow-md transition-all duration-300 group-hover:bottom-6">
                <h3 className="text-xl font-sans text-gray-800">
                  {destination.name}
                </h3>
                <p className="text-sm text-gray-600">{destination.class}</p>
                <p className="text-lg mt-1 text-gray-900">
                  Desde ${destination.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <button className="bg-transparent text- border-2 border-blue-600 hover:bg-[#0e254d] hover:text-white transition duration-300 px-8 py-3 rounded-full font-sans tracking-wide">
            Descubre tu nueva aventura
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
