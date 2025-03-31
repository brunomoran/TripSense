import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import Map from '../components/Map';
import ListItems from '../components/ListItems';

import { POI } from '../types/ListItem';

import "../styles/TravelPrep.css";

type Props = {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const TravelPrep = (props: Props) => {
  const POIList = [
    {
      id: 1,
      name: "Parc Güell",
      description: "Un parque público con jardines y arquitectura de Antoni Gaudí.",
      imageUrl: "https://example.com/parc-guell.jpg",
      location: { lat: 41.4145, lng: 2.1527 },
      category: "Parque"
    },
    {
      id: 2,
      name: "Sagrada Familia",
      description: "Una basílica católica diseñada por Antoni Gaudí.",
      imageUrl: "https://example.com/sagrada-familia.jpg",
      location: { lat: 41.4036, lng: 2.1744 },
      category: "Monumento"
    }
  ]

  const handlePoiClick = (poi: POI) => {
    console.log(`Clicked on Point Of Interest: ${poi.name}`);
  }

  return (
    <>
      <Header />
      <div className="travel-prep-container">
        <div className='search-section'>
          <SearchBar placeholder="Barcelona" onChange={() => console.log("Content changed")} />
          <p className='location-text'>O prueba a</p>
          <button className='location-button'>Usar tu ubicación actual</button>
        </div>

        <div className="content-section">
          <div className="left-column">
            <FilterDropdown />
            <ListItems<POI>
              items={POIList}
              onItemClick={handlePoiClick}
              title={`Puntos de interés en ${'cityname'}`}
              emptyMessage='No hay puntos de interés disponibles para esta ubicación.' />
          </div>
          <Map />
        </div>
      </div>
      <Footer />
    </>
  )
}

export default TravelPrep

