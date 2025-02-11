import './App.css';
// ExploreEatOut.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Heart, MapPin, ChevronRight, Facebook, Instagram, Twitter } from 'lucide-react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

// Types
interface Coordinates {
  lat: number;
  lng: number;
}

interface Restaurant {
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  coordinates: Coordinates;
}

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick?: () => void;
}

// Header Component
const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-4 md:space-x-8">
          <h1 className="text-xl font-bold">taste food</h1>
          <div className="hidden md:flex items-center text-gray-600">
            <MapPin size={16} className="mr-1" />
            <span>Seoul, Apgujeong</span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="hover:text-gray-600">Ingredients</a>
          <a href="#" className="hover:text-gray-600">Recipes</a>
          <a href="#" className="hover:text-gray-600">Eat Out</a>
          <a href="#" className="hover:text-gray-600">K-Trend</a>
          <button className="px-4 py-2 text-white bg-black rounded-md">Log in</button>
          <button className="px-4 py-2 border rounded-md">Sign up</button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t p-4 space-y-4">
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin size={16} className="mr-1" />
            <span>Seoul, Apgujeong</span>
          </div>
          <a href="#" className="block hover:text-gray-600">Ingredients</a>
          <a href="#" className="block hover:text-gray-600">Recipes</a>
          <a href="#" className="block hover:text-gray-600">Eat Out</a>
          <a href="#" className="block hover:text-gray-600">K-Trend</a>
          <div className="flex flex-col space-y-2">
            <button className="w-full px-4 py-2 text-white bg-black rounded-md">Log in</button>
            <button className="w-full px-4 py-2 border rounded-md">Sign up</button>
          </div>
        </nav>
      )}
    </header>
  );
};

// Restaurant Card Component
const RestaurantCard: React.FC<Restaurant & { 
  onMouseEnter?: () => void; 
  onMouseLeave?: () => void;
  onClick?: () => void;
  index?: number;
}> = ({
  name,
  cuisine,
  location,
  rating,
  onMouseEnter,
  onMouseLeave,
  onClick,
  index
}) => (
  <div 
    className="relative rounded-lg overflow-hidden shadow-md cursor-pointer"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
  >
    <img src={`/src/img/${Number(index)+1}.jpg`} alt={name} className="w-full h-48 object-cover"/>
    <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md">
      <Heart size={20} className="text-gray-600" />
    </button>
    <div className="p-4">
      <span className="text-sm text-gray-600">{cuisine}</span>
      <h3 className="text-lg font-semibold mt-1">{name}</h3>
      <p className="text-sm text-gray-600">{location}</p>
      <div className="flex items-center mt-2">
        <div className="flex text-red-500">
          {'★'.repeat(Math.floor(rating))}
        </div>
        <span className="ml-1">{rating}</span>
      </div>
    </div>
  </div>
);

// Filter Button Component
const FilterButton: React.FC<FilterButtonProps> = ({ label, active, onClick }) => (
  <button 
    className={`px-4 py-2 rounded-full ${active ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
    onClick={onClick}
  >
    {label}
  </button>
);

// Google Maps Component
const GoogleMapComponent: React.FC<{
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
}> = ({ restaurants, selectedRestaurant }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Restaurant | null>(null);
  
  // 선택된 레스토랑이 변경될 때마다 지도 이동
  useEffect(() => {
    if (map && selectedRestaurant) {
      map.panTo(selectedRestaurant.coordinates);
      map.setZoom(17); // 적당한 줌 레벨로 설정
      setSelectedMarker(selectedRestaurant);
    }
  }, [selectedRestaurant, map]);

  const containerStyle = {
    width: '100%',
    height: '100%'
  };

  const defaultCenter = {
    lat: 37.5265,
    lng: 127.0385
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds();
    restaurants.forEach(restaurant => {
      bounds.extend(restaurant.coordinates);
    });
    map.fitBounds(bounds);
    setMap(map);
  }, [restaurants]);

  return (
    <LoadScript googleMapsApiKey="AIzaSyC_fYkVWzH2DqmMLuDQcU-cP_jMPJjb5JI">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={15}
        onLoad={onLoad}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {restaurants.map((restaurant, index) => (
          <Marker
            key={index}
            position={restaurant.coordinates}
            title={restaurant.name}
            animation={selectedRestaurant === restaurant ? google.maps.Animation.BOUNCE : undefined}
            onClick={() => setSelectedMarker(restaurant)}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.coordinates}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2">
              <h3 className="font-bold">{selectedMarker.name}</h3>
              <p className="text-sm">{selectedMarker.cuisine}</p>
              <p className="text-sm text-gray-600">{selectedMarker.location}</p>
              <div className="flex items-center mt-1">
                <span className="text-yellow-500">{'★'.repeat(Math.floor(selectedMarker.rating))}</span>
                <span className="ml-1 text-sm">{selectedMarker.rating}</span>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

// Footer Component
const Footer: React.FC = () => (
  <footer className="bg-gray-100 py-8 md:py-12">
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-400">taste food</h2>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Explore</h3>
          <ul className="space-y-2">
            {['Home', 'Ingredients', 'Recipes', 'Eat Out', 'K-Trend'].map(item => (
              <li key={item}><a href="#" className="text-gray-600 hover:text-gray-900">{item}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">About Us</h3>
          <ul className="space-y-2">
            {['Privacy Policy', 'Terms of Service', 'Editorial Guidelines', 'Cookie Policy'].map(item => (
              <li key={item}><a href="#" className="text-gray-600 hover:text-gray-900">{item}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Contact</h3>
          <ul className="space-y-2">
            {['Subscription FAQS', 'Manage Account'].map(item => (
              <li key={item}><a href="#" className="text-gray-600 hover:text-gray-900">{item}</a></li>
            ))}
          </ul>
          <div className="flex space-x-4 mt-4">
            <Facebook className="text-gray-600" />
            <Instagram className="text-gray-600" />
            <Twitter className="text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  </footer>
);

// Main Component
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  
  const restaurants: Restaurant[] = [
    {
      name: 'Alt A',
      cuisine: 'Asian',
      location: 'Apgujeong, Seoul, South Korea',
      rating: 4.5,
      coordinates: { lat: 37.5265, lng: 127.0385 }
    },
    {
      name: 'RMW Carne',
      cuisine: 'Italian',
      location: 'Apgujeong, Seoul, South Korea',
      rating: 4.5,
      coordinates: { lat: 37.5275, lng: 127.0395 }
    },
    {
      name: 'Paulette',
      cuisine: 'American',
      location: 'Apgujeong, Seoul, South Korea',
      rating: 4.5,
      coordinates: { lat: 37.5285, lng: 127.0375 }
    },
    {
      name: 'Submaeul',
      cuisine: 'Asian',
      location: 'Apgujeong, Seoul, South Korea',
      rating: 4.5,
      coordinates: { lat: 37.5255, lng: 127.0365 }
    },
    {
      name: 'Seoul Kitchen',
      cuisine: 'Korean',
      location: 'Apgujeong, Seoul, South Korea',
      rating: 4.7,
      coordinates: { lat: 37.5245, lng: 127.0355 }
    },
    {
      name: 'Bella Pasta',
      cuisine: 'Italian',
      location: 'Apgujeong, Seoul, South Korea',
      rating: 4.6,
      coordinates: { lat: 37.5235, lng: 127.0345 }
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full mx-auto md:px-32 px-6 py-8">
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <a href="#" className="hover:text-gray-900">Home</a>
          <ChevronRight size={16} className="mx-2" />
          <span>Eat Out</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Explore Eat Out</h2>
        
        <div className="mb-6">
          <div className="flex flex-nowrap overflow-x-auto pb-2 space-x-2 md:space-x-4">
            <FilterButton label="All" active={true} />
            <FilterButton label="Recommended" active={false} />
            <FilterButton label="Distance" active={false} />
            <FilterButton label="Cuisine Type" active={false} />
          </div>
          
          <div className="flex items-center mt-4 text-sm">
            <MapPin size={16} className="mr-2" />
            <span>Current location</span>
          </div>
        </div>

        <div className="md:flex md:flex-row hidden gap-6">
          <div className="w-full lg:w-3/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 grid-rows-none lg:grid-rows-3">
              {restaurants.map((restaurant, index) => (
                <RestaurantCard
                  key={index}
                  {...restaurant}
                  onMouseEnter={() => setSelectedRestaurant(restaurant)}
                  onMouseLeave={() => setSelectedRestaurant(null)}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  index={index}
                />
              ))}
            </div>

            <div className="flex justify-center space-x-2 mt-8">
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`w-8 h-8 rounded-full ${
                    page === currentPage ? 'bg-red-500 text-white' : 'bg-gray-100'
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button className="w-8 h-8 rounded-full bg-gray-100">
                <ChevronRight size={16} className="mx-auto" />
              </button>
            </div>
          </div>

          <div className="w-full lg:w-2/5 h-[400px] lg:h-screen lg:sticky lg:top-0">
            <GoogleMapComponent 
              restaurants={restaurants}
              selectedRestaurant={selectedRestaurant}
            />
          </div>
        </div>

        <div className="flex flex-col md:hidden gap-6">
        <div className="w-full lg:w-2/5 h-[400px] lg:h-screen lg:sticky lg:top-0">
            <GoogleMapComponent 
              restaurants={restaurants}
              selectedRestaurant={selectedRestaurant}
            />
          </div>
          <div className="w-full lg:w-3/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 grid-rows-none lg:grid-rows-3">
              {restaurants.map((restaurant, index) => (
                <RestaurantCard
                  key={index}
                  {...restaurant}
                  onMouseEnter={() => setSelectedRestaurant(restaurant)}
                  onMouseLeave={() => setSelectedRestaurant(null)}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  index={index}
                />
              ))}
            </div>

            <div className="flex justify-center space-x-2 mt-8">
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`w-8 h-8 rounded-full ${
                    page === currentPage ? 'bg-red-500 text-white' : 'bg-gray-100'
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button className="w-8 h-8 rounded-full bg-gray-100">
                <ChevronRight size={16} className="mx-auto" />
              </button>
            </div>
          </div>

          
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default App;